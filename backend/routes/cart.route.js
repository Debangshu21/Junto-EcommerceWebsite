import express from "express";
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

console.log("--- Loading: cart.route.js ---");

const router = express.Router();

// Route to get all products from cart
router.get("/", protectRoute, getCartProducts);

// Route to add product to cart
router.post("/", protectRoute, addToCart);

// Route to delete a product with any quantity from cart
router.delete("/", protectRoute, removeAllFromCart);

// Route to update quantity of product in cart
router.put("/:id", protectRoute, updateQuantity);

export default router;