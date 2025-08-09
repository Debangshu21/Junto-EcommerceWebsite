import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// Function to get data about models such as number of users, products
export const getAnalyticsData = async () => {
    // Counting the number of users and products
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Counting the number of orders and their total price amount
    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null, // it groups all documents together,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
            },
        },
    ]);

    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
        users: totalUsers,
        products: totalProducts,
        totalSales,
        totalRevenue,
    };
};


// Function to get daily sales data
export const getDailySalesData = async (startDate, endDate) => {
    try {
        // Get daily sales data of 7 day period
        const dailySalesData = await Order.aggregate([
            {
                // match documents that have createdAt between startDate and endDate that is the last 7 days
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                // group the documents by each day of last 7 day period and calculate the total sales and total revenue of each day
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        // example of dailySalesData
        // [
        // 	{
        // 		_id: "2024-08-18",
        // 		sales: 12,
        // 		revenue: 1450.75
        // 	},
        // ]

        // dates containing of last 7 day period
        const dateArray = getDatesInRange(startDate, endDate);
        // console.log(dateArray) // ['2024-08-18', '2024-08-19', ... ]

        // returning sales, revenue along wit of each date
        return dateArray.map((date) => {
            const foundData = dailySalesData.find((item) => item._id === date);

            return {
                date,
                sales: foundData?.sales || 0,
                revenue: foundData?.revenue || 0,
            };
        });
    } catch (error) {
        throw error;
    }
};

// Function to get dates of last 7 day period in the format YYYY-MM-DD in an array
function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}