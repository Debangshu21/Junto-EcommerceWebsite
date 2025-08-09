import express from "express";
import { login, logout, signup, refreshToken, getProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

console.log("--- Loading: auth.route.js ---");

const router = express.Router();

// Route to signup page
router.post("/signup", signup)

// Route to login page
router.post("/login", login)

// Route to logout page
router.post("/logout", logout)

// Route to Refresh token
router.post("/refresh-token", refreshToken);

// Route to User Profile
router.get("/profile", protectRoute, getProfile);

export default router;