import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js";

const router = express.Router();

// Route to analytics dashboard
router.get("/", protectRoute, adminRoute, async (req, res) => {
	try {
        // Get analytics data such as number of users, products, total sales, total revenue
        const analyticsData = await getAnalyticsData();

        // Calculate the start and end date for the last 7 day-period
        const endDate = new Date();
		const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.json({
			analyticsData,
			dailySalesData,
		});
    } catch (error) {
		console.log("Error in analytics route", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

export default router;