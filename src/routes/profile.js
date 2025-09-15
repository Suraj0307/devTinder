const express = require("express");
const profileRouter = express.Router();
const  {userAuth} = require("../middlewares/auth.js");
const {validateProfileEditData} = require("../utils/validation.js");
const {user} = require("../models/user.js");

// Profile View Route
profileRouter.get("/profile/view", userAuth, (req, res) => {
    res.status(200).json(req.user);
});


// Profile Edit Route
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        validateProfileEditData(req.body);

        const user = req.user;
        Object.assign(user, req.body);
        await user.save();

        res.status(200).json({ message: `${user.firstName}, your profile updated successfully` });

    } catch (error) {
        console.log("Error during edit " + error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

module.exports = { 
    profileRouter 
};