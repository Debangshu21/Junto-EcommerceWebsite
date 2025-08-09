import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


// Protects the route by checking if user is authenticated through having accessToken
// and then provides the request with user information
export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        // if accessToken doesn't exist
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized - No access token provided" });
        }

        try {
            // Decoding the token to get userId
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            // fetching user details without password
            const user = await User.findById(decoded.userId).select("-password");
            // if user doesn't exist
            if (!user) {
                return res.status(401).json({ message: "Unauthorized - User not found" });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorized - Access token expired" });
            }
            throw error;
        }

    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        return res.status(401).json({ message: "Unauthorized - Invalid access token" });
    }
}


// 
export const adminRoute = (req, res, next) => {
    // if user exists and that user is admin then go forward
    // else deny access
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: "Access denied - Admin only" });
    }
}