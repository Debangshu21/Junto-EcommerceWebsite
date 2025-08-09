// in package.json, "type": "module" allows to write like react imports instead of require
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request. limit 10mb allows upload of images till 10mbs
app.use(cookieParser()); // allows access to cookies and it's variables

console.log("--- Attaching Routes ---");

// Authentication routes
console.log("Attaching: /api/auth");
app.use("/api/auth", authRoutes);

// Product routes
console.log("Attaching: /api/products");
app.use("/api/products", productRoutes);

// Cart routes
console.log("Attaching: /api/cart");
app.use("/api/cart", cartRoutes);

// Coupon routes
console.log("Attaching: /api/coupons");
app.use("/api/coupons", couponRoutes);

// Payment routes
console.log("Attaching: /api/payments");
app.use("/api/payments", paymentRoutes);

// Analytics routes
console.log("Attaching: /api/analytics");
app.use("/api/analytics", analyticsRoutes);

console.log("--- All Routes Attached Successfully ---");

// Serve frontend if in production
if (process.env.NODE_ENV === "production") {
    console.log("--- Production mode detected. Setting up frontend routes. ---");

    console.log("Setting up static middleware...");
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    console.log("Static middleware configured.");

    console.log("Setting up wildcard GET route...");
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
    console.log("Wildcard GET route configured.");
} else {
    console.log("--- Development mode detected. Skipping frontend routes. ---");
}

console.log("--- Configuration complete. Calling app.listen(). ---");

app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
    connectDB();
});