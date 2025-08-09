import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCartStore } from "../stores/useCartStore";

const GiftCouponCard = () => {
    // State to hold the code entered by the user
    const [userInputCode, setUserInputCode] = useState("");
    const { coupon, isCouponApplied, applyCoupon, getMyCoupon, removeCoupon } = useCartStore();

    // Fetch the user's active coupon when the component mounts
    useEffect(() => {
        getMyCoupon();
    }, [getMyCoupon]);

    // Set the user input code when the coupon changes
    useEffect(() => {
        if (coupon) setUserInputCode(coupon.code);
    }, [coupon]);

    // Function to handle applying the coupon
    const handleApplyCoupon = () => {
        if (!userInputCode) return;
        applyCoupon(userInputCode);
    };

    // Function to handle removing the coupon
    const handleRemoveCoupon = async () => {
        await removeCoupon();
        setUserInputCode("");
    };

    return (
        <motion.div
            className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className='space-y-4'>
                {/* Input field for the code */}
                <div>
                    {/* Label */}
                    <label htmlFor='voucher' className='mb-2 block text-sm font-medium text-gray-300'>
                        Do you have a voucher or gift card?
                    </label>
                    {/* Input to enter a coupon */}
                    <input
                        type='text'
                        id='voucher'
                        className='block w-full rounded-lg border border-gray-600 bg-gray-700 
            p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500 
            focus:ring-emerald-500'
                        placeholder='Enter code here'
                        value={userInputCode}
                        onChange={(e) => setUserInputCode(e.target.value)}
                        required
                    />
                </div>

                {/* Button to apply the coupon */}
                <motion.button
                    type='button'
                    className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApplyCoupon}
                >
                    Apply Code
                </motion.button>
            </div>

            {/* If coupon exists and is applied, Display the applied coupon */}
            {isCouponApplied && coupon && (
                <div className='mt-4'>
                    <h3 className='text-lg font-medium text-gray-300'>Applied Coupon</h3>

                    {/* Displays the percentage off due to the coupon */}
                    <p className='mt-2 text-sm text-gray-400'>
                        {coupon.code} - {coupon.discountPercentage}% off
                    </p>

                    {/* Button to remove the coupon */}
                    <motion.button
                        type='button'
                        className='mt-2 flex w-full items-center justify-center rounded-lg bg-red-600 
            px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none
             focus:ring-4 focus:ring-red-300'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRemoveCoupon}
                    >
                        Remove Coupon
                    </motion.button>
                </div>
            )}

            {/* Displays the available coupon and percentage off */}
            {coupon && (
                <div className='mt-4'>
                    <h3 className='text-lg font-medium text-gray-300'>Your Available Coupons:</h3>
                    <p className='mt-2 text-sm text-gray-400'>
                        {coupon.code} - {coupon.discountPercentage}% off
                    </p>
                </div>
            )}
        </motion.div>
    );
};
export default GiftCouponCard;