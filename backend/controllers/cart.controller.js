import Product from "../models/product.model.js";

// Function to get all products from cart
export const getCartProducts = async (req, res) => {
    try {
        // Find all products in the user's cart
        const products = await Product.find({ _id: { $in: req.user.cartItems } });

        // Add the quantity of each product to the cart
        const cartItems = products.map(product => {
            // Find the quantity of the product in the user's cart
            const item = req.user.cartItems.find(cartItem => cartItem.id === product.id);
            // Return the product with the quantity
            return { ...product.toJSON(), quantity: item.quantity };
        })

        res.json(cartItems);
    } catch (error) {
        console.log("Error in getCartProducts Controller:", error.message);
        res.status(500).json({ message: "Server Error:", error: error.message });
    }
}


// Function to add product to cart
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        // Check if the user already has the product in their cart
        const existingItem = user.cartItems.find(item => item.id === productId);
        // If the product is already in the cart, increment its quantity
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // If the product is not in the cart, add it with a quantity of 1
            user.cartItems.push(productId);
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in addToCart Controller:", error.message);
        res.status(500).json({ message: "Server Error:", error: error.message });
    }
};


// Function to remove product from cart
export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        // if the product id doesn't exist, return empty cart
        if (!productId) {
            user.cartItems = [];
        } else {
            // Remove the product from the cart
            user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// function to update quantity of product
export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;

        // Check if the product exists in the user's cart
        const existingItem = user.cartItems.find((item) => item.id === productId);

        if (existingItem) {
            // if quantity is 0, remove the product from cart
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter((item) => item.id !== productId);
                await user.save();
                return res.json(user.cartItems);
            }

            // if not 0, Update the quantity of the product
            existingItem.quantity = quantity;
            await user.save();
            res.json(user.cartItems);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log("Error in updateQuantity Controller:", error.message);
        res.status(500).json({ message: "Server Error:", error: error.message });
    }
};