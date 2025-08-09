import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";

// Generating access and refresh token used in authentication
const generateTokens = (userId) => {
    // Creating access token
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m" // accessToken expires in 15 minutes
    });

    // Creating refresh token
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d" // refreshToken expires in 7 days
    })

    return { accessToken, refreshToken };
}

// Funtion to store the refresh token in upstash redis
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7 days
}

// Function to set the cookies
const setCookies = (res, accessToken, refreshToken) => {
    // Generating accessToken cookie
    res.cookie("accessToken", accessToken, { // first param is name, second param is value
        httpOnly: true, // prevents XSS attacks, cross-site scripting attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // prevents CSRF attacks, cross-site request forgery attacks
        maxAge: 15 * 60 * 1000, // 15 mins
    });

    // Generating refreshToken cookie
    res.cookie("refreshToken", refreshToken, { // first param is name, second param is value
        httpOnly: true, // prevents XSS attacks, cross-site scripting attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // prevents CSRF attacks, cross-site request forgery attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}


// Signup page controller
// Checks if all params are correct and exists and then creates user in db
// Generates tokens and adds them to cookies for authentication, also adds refreshToken to upstash redis
export const signup = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // Regular expression to verify email is correct format or not
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Checking if user exists already, if yes then can't signup
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password });

        // Authenticate using jwt tokens and cookies
        // accessTokens are used to gain access to account, To keep it safe from hackers it expirees in 15 mins
        // refreshTokens are used to create new accessTokens for once they expire so the user can be authenticated again

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);
        // Storing refresh token in upstash redis
        await storeRefreshToken(user._id, refreshToken);

        // Setting cookies using the tokens
        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.log("Error in Signup Controller:", error.message);
        res.status(500).json({ message: error.message });
    }

};


// Login page controller
// Compares password if true then login successfull
// creates the 2 tokens again and added to cookie and redis upstash for authentication
export const login = async (req, res) => {
    try {
        // fetching fields of user needed for login and checking if user exists in db
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // If user exists in db and password matches then authenticate the user
        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateTokens(user._id);

            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(400).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.log("Error in Login Controller:", error.message);
        res.status(500).json({ message: error.message });
    }
};


// Logout page controller
// Deletes tokens from cookies and deletes refreshtoken from upstash redis to logout the user
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        // If refreshToken exists in the cookie then deleting it from upstash redis
        if (refreshToken) {
            // Decoding refreshToken to obtain userId so that we can delete the token from upstash redis
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`);
        }

        // Deleting both accessToken and refreshToken from the cookie
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in Logout Controller:", error.message);
        res.status(500).json({ message: "Server Error:", error: error.message });
    }
};


// This will refresh the access token with the help of refreshtoken so user can be authenticated again 
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        // If refreshToken doesn't exist in the cookie then show error message
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        // Decoding the refreshToken to obtain  userId so it can be used to match the refreshToken in upstash redis
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        // Fetching the refreshToken in redis upstash using the user id
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

        // If the stored refreshToken in upstash redis is not equal to the refreshToken in cookie
        // then it means the user is trying to fool us
        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        // Generating accessToken
        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m"
        });

        // Setting cookie with the accessToken
        res.cookie("accessToken", accessToken, {
            httpOnly: true, // prevents XSS attacks, cross-site scripting attacks
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", // prevents CSRF attacks, cross-site request forgery attacks
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.json({ message: "Token refreshed successfully" });
    } catch (error) {
        console.log("Error in refreshToken Controller:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log("Error in getProfile Controller:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}