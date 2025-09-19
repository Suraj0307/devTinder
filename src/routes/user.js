const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const { ConnectionRequest } = require("../models/connectionRequest");
const USER_SAFE_DATA = ["firstName", "lastName", "photoUrl", "age", "gender", "about", "skills"];
const User = require("../models/user");

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

// Getting the feed for the logged-in user
userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        limit = limit > 50 ? 50 : limit; // max limit is 50

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id},
                { toUserId: loggedInUser._id}
            ]
        }).select("fromUserId toUserId");
        
        const hideUsersFromFeed = new Set();
        hideUsersFromFeed.add(loggedInUser._id.toString());

        connectionRequests.forEach((request) => {
            hideUsersFromFeed.add(request.fromUserId.toString());
            hideUsersFromFeed.add(request.toUserId.toString());
        });

        const users = await User.find({
            _id: { $nin: Array.from(hideUsersFromFeed) }
        }, USER_SAFE_DATA).skip((page - 1) * limit).limit(limit);

        res.status(200).json(users);
    } catch (error) {
        console.log("Error fetching users for feed:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = {
    userRouter
};