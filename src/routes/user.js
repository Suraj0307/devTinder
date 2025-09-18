const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const { ConnectionRequest } = require("../models/connectionRequest");
const USER_SAFE_DATA = ["firstName", "lastName", "photoUrl", "age", "gender", "about", "skills"];

// getting all pending connection request for the loggedIn User
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find(
            { toUserId: loggedInUser._id,
                status: "interested" }).populate("fromUserId", ["firstName", "lastName", "photoUrl", "age", "gender", "about", "skills"]);

        res.status(200).json(connectionRequests);
    } catch (error) {
        console.log("Error fetching user requests:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


// getting all connections of a user
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionsRequests = await ConnectionRequest.find({
            "$or": [
                { fromUserId: loggedInUser._id, status: "accepted" },
                { toUserId: loggedInUser._id, status: "accepted" }
            ]
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA);

        const data = connectionsRequests.map((row) => {
            if (row.fromUserId._id.equals(loggedInUser._id)) {
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.status(200).json(data);
    } catch (error) {
        console.log("Error fetching user connections:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = {
    userRouter
};