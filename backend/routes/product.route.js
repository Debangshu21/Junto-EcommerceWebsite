import express from "express";
import {
    createProduct,
    getAllProducts,
    getFeaturedProducts,
    deleteProduct,
    getRecommendedProducts,
    getProductsByCategory,
    toggleFeaturedProduct
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

console.log("--- Loading: product.route.js ---");

const router = express.Router();


// route for admin to get all products
router.get("/", protectRoute, adminRoute, getAllProducts);

// route for all to get featured products even if not logged in
router.get("/featured", getFeaturedProducts);

// route to get specific products by category
router.get("/category/:category", getProductsByCategory);

// route for all to get recommended products
router.get("/recommendations", getRecommendedProducts);

// route to create a product by admin
router.post("/", protectRoute, adminRoute, createProduct);

// route to toggle product is featured or not by admin
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);

// route to delete a product by admin
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;