const express = require("express");
const requestRouter = express.Router();
const  {userAuth} = require("../middlewares/auth.js");
const { ConnectionRequest } = require("../models/connectionRequest.js");
const User = require("../models/user.js");
const USER_SAFE_DATA = ["firstName", "lastName", "photoUrl", "age", "gender", "about", "skills"];

// Sending connection request
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user.id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        
        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        };

        // checking if toUserId is a valid id or not
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // If there exists and existing connectionRequest
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId, toUserId}, // user already sent a connection request
                {fromUserId: toUserId, toUserId: fromUserId} // next person has sent the connection already
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ error: "Connection request already exists" });
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId, 
            toUserId,
            status
        });

        const data = await connectionRequest.save();
        res.status(200).json({message: `${req.user.firstName} sent a ${status} Request to ${toUser.firstName}`, data: data});
    } catch (error) {
        console.log("Error during sending connection request " + error.message);
        res.status(500).json({ error: error.message });
    }
});


// Reviewing connection request
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const status = req.params.status;
        const requestId = req.params.requestId;

        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        };

        // Checking if requestId exists in db
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "accepted"
        }).populate("fromUserId", USER_SAFE_DATA);

        if (!connectionRequest) {
            return res.status(404).json({ error: "Connection request not found" });
        }

        // If the logged-in user is the recipient, update the status
        connectionRequest.status = status

        const data = await connectionRequest.save();
        res.status(200).json({ message: ` ${loggedInUser.firstName} ${status} connection request of ${data.fromUserId.firstName} successfully`, data: data });
    } catch (error) {
        console.log("Error during reviewing connection request " + error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    requestRouter
};