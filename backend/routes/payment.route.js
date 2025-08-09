import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkoutSuccess, createCheckoutSession } from "../controllers/payment.controller.js";

console.log("--- Loading: payment.route.js ---");

const router = express.Router();

// Route to checkout page session
router.post("/create-checkout-session", protectRoute, createCheckoutSession);

// Route to create a new order after successful checkout session
router.post("/checkout-success", protectRoute, checkoutSuccess);

export default router;