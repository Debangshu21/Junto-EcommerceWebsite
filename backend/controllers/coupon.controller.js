import Coupon from "../models/coupon.model.js";

// Function to get the user's active coupon
export const getCoupon = async (req, res) => {
    try {
        // Find the user's active coupon
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
        res.json(coupon || null);
    } catch (error) {
        console.log("Error in getCoupon Controller:", error.message);
        res.status(500).json({ message: "Server Error:", error: error.message });
    }
};

// Function to validate a coupon 
export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        // Find the user's active coupon based on code provided by the user
        const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true })

        // If the coupon is not found, return error
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        // If the coupon is expired,coupon has expired so return error
        if (coupon.expirationDate < new Date()) {
            coupon.isActive = false;
            await coupon.save();
            return res.status(404).json({ message: "Coupon expired" });
        }

        // If the coupon is found and not expired, return success with coupon details
        res.json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        })

    } catch (error) {
        console.log("Error in validateCoupon Controller:", error.message);
        res.status(500).json({ message: "Server Error:", error: error.message });
    }
};