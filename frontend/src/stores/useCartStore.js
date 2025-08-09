import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

// zustand feature which acts as a global state to create cart store used to various features such as add to cart, remove from cart etc
export const useCartStore = create((set, get) => ({
    // Initial state
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    isCouponApplied: false,

    // Function to fetch the user's active coupon from the backend
    getMyCoupon: async () => {
        try {
            const response = await axios.get("/coupons");
            set({ coupon: response.data });
        } catch (error) {
            console.error("Error fetching coupon:", error);
        }
    },

    // Function to apply a coupon and calculate the total
    applyCoupon: async (code) => {
        try {
            const response = await axios.post("/coupons/validate", { code });
            set({ coupon: response.data, isCouponApplied: true });
            // Recalculate the total and update the state || displays changes in seconds to user (zustand)
            get().calculateTotals();
            toast.success("Coupon applied successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to apply coupon");
        }
    },

    // Function to remove the applied coupon and calculate the total
    removeCoupon: () => {
        set({ coupon: null, isCouponApplied: false });
        // Recalculate the total and update the state || displays changes in seconds to user (zustand)
        get().calculateTotals();
        toast.success("Coupon removed");
    },

    // Function to fetch the cart items from the backend and calculate the total
    getCartItems: async () => {
        try {
            const res = await axios.get("/cart");
            set({ cart: res.data });
            // Recalculate the total and update the state | displays changes in seconds to user (zustand)
            get().calculateTotals();
        } catch (error) {
            set({ cart: [] });
            toast.error(error.response.data.message || "An error occurred");
        }
    },

    // Function to clear the cart and everything else
    clearCart: async () => {
        set({ cart: [], coupon: null, total: 0, subtotal: 0 });
    },

    // Function to add a product to the cart and calculate the total by sending a POST request to backend
    addToCart: async (product) => {
        try {
            await axios.post("/cart", { productId: product._id });

            // Update the cart state with the new product or increment quantity
            set((prevState) => {
                // Check if the product is already in the cart
                const existingItem = prevState.cart.find((item) => item._id === product._id);
                // If item already exists in cart, update card by increment quantity only else add item
                const newCart = existingItem
                    ? prevState.cart.map((item) =>
                        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                    )
                    : [...prevState.cart, { ...product, quantity: 1 }];
                return { cart: newCart };
            });
            // Recalculate the total and update the state || displays changes in seconds to user (zustand)
            get().calculateTotals();
        } catch (error) {
            toast.error(error.response.data.message || "An error occurred");
        }
    },

    // Function to remove a product from the cart and calculate the total
    removeFromCart: async (productId) => {
        await axios.delete(`/cart`, { data: { productId } });
        // Remove the product from the cart
        set((prevState) => ({ cart: prevState.cart.filter((item) => item._id !== productId) }));
        // Recalculate the total and update the state || displays changes in seconds to user (zustand)
        get().calculateTotals();
    },

    // Function to update the quantity of a product in the cart
    updateQuantity: async (productId, quantity) => {
        // If quantity is 0, remove the product from the cart
        if (quantity === 0) {
            get().removeFromCart(productId);
            return;
        }

        await axios.put(`/cart/${productId}`, { quantity });
        // Update the quantity of the product
        set((prevState) => ({
            cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)),
        }));
        // Recalculate the total and update the state || displays changes in seconds to user (zustand)
        get().calculateTotals();
    },

    // Function to calculate the total and subtotal based on the cart and coupon
    calculateTotals: () => {
        const { cart, coupon } = get();
        // Calculate the subtotal
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subtotal;

        // Apply the discount if a coupon is applied
        if (coupon) {
            const discount = subtotal * (coupon.discountPercentage / 100);
            total = subtotal - discount;
        }

        set({ subtotal, total });
    },
}));