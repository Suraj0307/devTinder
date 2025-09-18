const express = require("express");
const {connectDB} = require("./config/database.js");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
app.use(express.json());

const {authRouter} = require("./routes/auth.js");
const {profileRouter} = require("./routes/profile.js");
const {requestRouter} = require("./routes/request.js");
const {userRouter} = require("./routes/user.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);


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