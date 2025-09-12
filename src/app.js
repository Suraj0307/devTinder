const express = require("express");
const {connectDB} = require("./config/database.js");
const User = require('./models/user.js');
const { validateSignUpData } = require("./utils/validation.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();

app.use(express.json());

// User signup route
app.post("/signup", async(req, res) => {

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

        const token = await jwt.sign({emailId: newUser.emailId }, process.env.JWT_SECRET);
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
app.post("/login", async(req, res) => {
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

        if (await bcrypt.compare(password, user.password)) {
            // Passwords match
            res.status(200).json({ message: "Login successful", token });
        } else {
            // Passwords do not match
            res.status(401).json({ message: "Invalid Credentials" });
        }

    } catch (error) {
        console.error("Error occurred during login " + error.message);
        res.status(400).json({ message: error.message });
    }
})

// User feed route
app.get("/feed", async(req, res) => {
    try {
        const { token } = req.cookies;

        const decodedMessage = await jwt.verify(token, process.env.JWT_SECRET);

        const { _id } = decodedMessage;
        console.log("User ID from token:", _id);
        
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// to get a user by emailId
app.get("/user", async (req, res) => {
    try {
        const { emailId } = req.body;
        const user = await User.find({ emailId: emailId });

        if (user.length === 0)
            res.status(500).json({ message: "Couldn't find a User with the emailId" });
        res.status(200).json(user);
    } catch (error) {
        console.error("Error finding user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// delete the user by using _id
app.delete("/user", async (req, res) => {
    try {
        const { _id } = req.body;
        const user = await User.findByIdAndDelete(_id);

        if (!user) {
            res.status(404).json({ message: "User not found" });
        } else {
            res.status(200).json({ message: "User deleted successfully" });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// update the user by using _id
app.patch("/user/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;
        const allowed_updates = ["firstName", "lastName", "password", "age", "skills", "photoUrl", "gender", "about"];

        const isUpdateAllowed = Object.keys(data).every((k) => allowed_updates.includes(k));
        if(!isUpdateAllowed) {
            return res.status(400).json({ message: "Invalid update fields" });
        }

        const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });

        if (!user) {
            res.status(404).json({ message: "User not found" });
        } else {
            res.status(200).json({ message: "User updated successfully", user });
        }

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

connectDB()
.then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
})
.catch((error) => {
    console.log("Database connection failed:", error);
    process.exit(1);
});