const express = require("express");
const {connectDB} = require("./config/database.js")
const User = require('./models/user.js');

const app = express();

app.use(express.json());

app.post("/signup", async(req, res) => {

    try {
        const { firstName, lastName, emailId, password } = req.body;
        const user = new User({
            firstName,
            lastName,
            emailId,
            password
        });

        await user.save()
        res.status(201).json({ message: "User created successfully" });
    }
    catch(error){
        console.error("Error creating user:", error);
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