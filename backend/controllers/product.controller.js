import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";


// function to get allProducts by admin
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}); // find all products
        res.json({ products });
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// function to get featuredProducts by everyone even if not logged in
// also saves the featuredProducts to redis
export const getFeaturedProducts = async (req, res) => {
    try {
        // if featuredProducts are in redis then fetch it from redis
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts));
        }

        // if not in redis, fetch from mongodb
        // .lean() returns a plain javascript object instead of mongodb document which is good for performance
        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }

        // store in redis for future quick access
        await redis.set("featured_products", JSON.stringify(featuredProducts));

        res.json(featuredProducts);
    } catch (error) {
        console.log("Error in getFeaturedProducts Controller:", error.message);
        res.status(500).json({ message: "Server Error:", error: error.message });
    }
};

// function to create a product by an admin
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;

        let cloudinaryResponse = null;

        // upload image to cloudinary if image exists
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }

        // create product
        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "", // if cloudinaryResponse is null, then set image to empty string
            category,
        });

        res.status(201).json(product);
    } catch (error) {
        console.log("Error in createProduct controller:", error.message);
        res.status(500).json({ message: "Server Error:", error: error.message });
    }
};


// function to delete a product by an admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        // if product doesn't exist
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // if product image exists, delete it from cloudinary db 
        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0]; // this will get the id of the image from cloudinary
            try {
                // deletes image from cloudinary
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("deleted image from cloduinary");
            } catch (error) {
                console.log("error deleting image from cloduinary", error);
            }
        }

        // deleting the product from the mongodb
        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


// function to get recommended products for all in cart page (users also bought...)
export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: { size: 4 } // get 4 random products
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    price: 1,
                    image: 1
                } // project only these fields
            }
        ])

        res.json(products);
    } catch (error) {
        console.log("Error in getRecommendedProducts Controller:", error.message);
        res.status(500).json({ message: "Server Error:", error: error.message });
    }
};


// function to get specific products by category
export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// function to toggle isFeatured of a product and then update it in mongodb and redis
export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        // toggle isFeatured and update mongodb and redis if product is found
        // else return 404
        if (product) {
            // toggle isFeatured and then saved to mongodb
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();

            // update featuredProducts in redis
            await updateFeaturedProductsCache();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log("Error in toggleFeaturedProduct Controller:", error.message);
        res.status(500).json({ message: "Server Error:", error: error.message });
    }
}

// function to update the featuredProducts in redis
async function updateFeaturedProductsCache() {
    try {
        // .lean() returns a plain javascript object instead of mongodb document which is good for performance
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts))
    } catch (error) {
        console.log("Error in updateFeaturedProductsCache function:", error.message);
    }
}