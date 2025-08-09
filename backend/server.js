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

// Authentication routes
app.use("/api/auth", authRoutes);

// Product routes
app.use("/api/products", productRoutes);

// Cart routes
app.use("/api/cart", cartRoutes);

// Coupon routes
app.use("/api/coupons", couponRoutes);

// Payment routes
app.use("/api/payments", paymentRoutes);

// Analytics routes
app.use("/api/analytics", analyticsRoutes);

// Serve frontend if in production
if (process.env.NODE_ENV === "production") {
    // Set static folder dist which is optimized react build
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    // Any other route will redirect to index.html
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}


app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);

    connectDB();
});