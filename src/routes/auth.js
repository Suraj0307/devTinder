const express = require("express");
const authRouter = express.Router();
const User = require('../models/user.js');
const { validateSignUpData } = require("../utils/validation.js");
const bcrypt = require("bcrypt");
require("dotenv").config();

// User signup route
authRouter.post("/signup", async(req, res) => {

    try {
        // validation of data
        validateSignUpData(req);

        const { firstName, lastName, emailId, password } = req.body;

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(req.body.password, salt);
        
        // creating a new instance of the user
        const newUser = new User({
            firstName,  
            lastName,
            emailId,
            password: passwordHash
        });

        await newUser.save();

        const token = await newUser.getJWT();
        res.cookie("token", token, {
        httpOnly: true
        });

        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(400).json({ message: error.message });
    }
});

// User login route
authRouter.post("/login", async(req, res) => {
    try {
        const { emailId, password } = req.body;

        // validate emailId and password
        if(!emailId || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        
        // check if user exists inside database or not
        const user = await User.findOne({ emailId: emailId });
        if(!user) {
            return res.status(404).json({ message: "Invalid Credentials" });
        }

        if (await user.validatePassword(password)) {
            // Passwords match
            
            // creating token
            const token = await user.getJWT();
            res.cookie("token", token, {
                httpOnly: true
            });

            res.status(200).json({ message: "Login successful" });
        } else {
            // Passwords do not match
            res.status(401).json({ message: "Invalid Credentials" });
        }

    } catch (error) {
        console.error("Error occurred during login " + error.message);
        res.status(400).json({ message: error.message });
    }
})

// User logout route
authRouter.post("/logout", (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.log("Error during logout: " + error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
})



module.exports = {
    authRouter
}
