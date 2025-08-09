import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

// zustand feature which acts as a global state
// User Store containing various user related functions to allow functionality between frontend and backend
export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    // Function to signup the user and set the user state by linking frontend and backend
    signup: async ({ name, email, password, confirmPassword }) => {
        // Set loading to true while sending request and waiting for response
        set({ loading: true });

        // Check if passwords match
        if (password !== confirmPassword) {
            set({ loading: false });
            return toast.error("Passwords do not match");
        }

        try {
            // Send request to backend to create user
            const res = await axios.post("/auth/signup", { name, email, password });
            // set user to response recieved from backend
            set({ user: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "An error occured");
        }
    },

    // Function to login the user and set the user state by linking frontend and backend
    login: async (email, password) => {
        // Set loading to true while sending request and waiting for response
        set({ loading: true });

        try {
            // Send request to backend to create user
            const res = await axios.post("/auth/login", { email, password });
            // set user to response recieved from backend
            set({ user: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "An error occured");
        }
    },

    // Function to logout the user
    logout: async () => {
        try {
            // Send request to backend to logout user
            await axios.post("/auth/logout");
            // set user to null
            set({ user: null });
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred during logout");
        }

    },

    // Function to check if uuser is authenticated or not and set the user state so that refreshing login/signup page doesn't show form again and instead the homepage
    checkAuth: async () => {
        set({ checkingAuth: true });
        try {
            const response = await axios.get("/auth/profile");
            set({ user: response.data, checkingAuth: false });
        } catch (error) {
            console.log(error.message);
            set({ checkingAuth: false, user: null });
        }
    },
    // Function to refresh token to refresh access token using refresh token
    refreshToken: async () => {
        // Prevent multiple simultaneous refresh attempts
        if (get().checkingAuth) return;

        set({ checkingAuth: true });
        try {
            const response = await axios.post("/auth/refresh-token");
            set({ checkingAuth: false });
            return response.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            throw error;
        }
    },
}));

// Axios interceptor for token refresh
let refreshPromise = null;

// Creates an access token using resfresh token after it expires in 15mins 
axios.interceptors.response.use(
    // if access token hasn't expired then return response
    (response) => response,

    // if access token has expired then refresh it using refresh token
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // If a refresh is already in progress, wait for it to complete
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }

                // Start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login or handle as needed
                useUserStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);