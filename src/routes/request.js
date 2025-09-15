const express = require("express");
const requestRouter = express.Router();
const  {userAuth} = require("../middlewares/auth.js");

// Sending connection request
requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
    try {
        
    } catch (error) {

    }
});

module.exports = {
    requestRouter
};