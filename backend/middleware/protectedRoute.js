import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const protectedRoute = async (req, res, next) => {
    try {
        // Check if the JWT cookie exists
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ msg: "Unauthorized: No Token Provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ msg: "Unauthorized: Invalid Token Provided" });
        }

        // Find the user by decoded ID and exclude the password field
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ msg: "Unauthorized: User Not Found" });
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectedRoute middleware: " + error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
