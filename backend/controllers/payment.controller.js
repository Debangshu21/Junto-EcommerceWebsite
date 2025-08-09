import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";


// Function to get the products from cart of user and create a checkout session
export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;

        //  Check if the products array is valid
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid or empty products array" });
        }

        let totalAmount = 0;

        const lineItems = products.map(product => {
            // stripe wants in the format of cents => $10 * 100 = 1000 cents
            const amount = Math.round(product.price * 100);
            totalAmount += amount * product.quantity;

            // Return the product with the currency, quantity, name and images
            return {
                price_data: {
                    currency: "usd",
                    unit_amount: amount,
                    product_data: {
                        name: product.name,
                        images: [product.image]
                    }
                },
                quantity: product.quantity || 1,
            };
        });

        let coupon = null;

        // If the user has applied a coupon
        if (couponCode) {
            // Check if the coupon is valid
            coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
            // If the coupon is valid, apply the discount
            if (coupon) {
                totalAmount -= Math.round(totalAmount * (coupon.discountPercentage / 100));
            }
        }

        // Create the checkout session using stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`, // pass the session id to the success page
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon
                ? [
                    {
                        coupon: await createStripeCoupon(coupon.discountPercentage),
                    },
                ]
                : [],
            metadata: {
                userId: req.user._id.toString(), // mongodb object to string
                couponCode: couponCode || "",
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price,
                    }))
                ),
            },
        });

        // if bill is greater than or equal to $200 then create a new coupon for next purchase
        if (totalAmount >= 20000) { // 200 dollars
            await createNewCoupon(req.user._id);
        }

        // Send the checkout session id to the frontend so we can see the checkout page along with total amount in dollars
        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });

    } catch (error) {
        console.log("Error in checkoutSuccess Controller:", error.message);
        res.status(500).json({ message: "Error processing checkout", error: error.message });
    }
};


// Function to create a new order after successful checkout session
export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        // Retrieve the checkout session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            // If the payment is successful, set user's coupon to inactive
            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate(
                    {
                        code: session.metadata.couponCode,
                        userId: session.metadata.userId,
                    },
                    {
                        isActive: false,
                    }
                );
            }

            // Create a new order since payment has been done
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map(product => ({
                    product: product.id,
                    quantity: product.quantity,
                    price: product.price
                })),
                totalAmount: session.amount_total / 100, // cents to dollars
                stripeSessionId: sessionId
            })

            await newOrder.save();
            res.status(200).json({
                success: true,
                message: "Payment successful, order created, and coupon deactivated if used",
                orderId: newOrder._id
            });
        }

    } catch (error) {
        console.log("Error in checkoutSuccess Controller:", error.message);
        res.status(500).json({ message: "Error processing successful checkout", error: error.message });
    }
}


// Function to create a stripe coupon
async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once"
    });

    return coupon.id;
};

// Function to create a new coupon
async function createNewCoupon(userId) {
    // Delete the user's old coupon
    await Coupon.findOneAndDelete({ userId });

    // Create a new coupon
    const newCoupon = new Coupon({
        // Generate a random code
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        userId: userId,
    });

    await newCoupon.save();
    return newCoupon;
};