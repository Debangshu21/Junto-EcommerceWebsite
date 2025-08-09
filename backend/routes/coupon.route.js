import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";

console.log("--- Loading: coupon.route.js ---");

const router = express.Router();

// Route to get user's active coupon
router.get("/", protectRoute, getCoupon);

// Route to validate a coupon so the user doesn't fool us
router.post("/validate", protectRoute, validateCoupon);

export default router;