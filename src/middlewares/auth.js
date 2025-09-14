const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const userAuth = async (req, res, next) => {
    try {
        // Read the token
        const {token} = req.cookies;
        if (!token) {
            throw new Error("No token found");
        }

        const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

        const {_id} = decodedObj;

        const user = await User.findById(_id);
        if (!user) {
            throw new Error("User not found"); 
        }
        req.user = user;
        next();

    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: error.message });
    }

}

module.exports = {
    userAuth,
}