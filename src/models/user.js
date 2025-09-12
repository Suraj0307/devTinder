const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String, 
        required: true,
        minLength: 4,
        maxLength: 50
    }, 
    lastName: {
        type: String, 
        required: true,
        minLength: 4,
        maxLength: 50
    }, 
    emailId: {
        type: String,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid email format: " + value);
            }
        },
        lowercase: true,
        required: true,
        unique: true,
        minLength: 10,
        maxLength: 100,
        trim: true
    },
    password: {
        type: String,
        validate(value) {
            if(!validator.isStrongPassword(value)) {
                throw new Error("Password must be at least 6 characters long and contain a mix of letters, numbers, and symbols.");
            }
        },
        required: true,
        minLength: 6,
        maxLength: 100
    },
    age: {
        type: Number,
        required: false,
        min: 18,
        max: 100
    },
    gender: {
        type: String,
        required: false,
        validate(value) {
            const validGenders = ["Male", "Female", "Others"];
            if (!validGenders.includes(value)) {
                throw new Error(`${value} is not a valid gender!`);
            }
        }   
    },
    photoUrl: {
        type: String,
        validate(value) {
            if(!validator.isURL(value)) {
                throw new Error("Invalid URL format: " + value);
            }
        },
        default: "https://geographyandyou.com/images/user-profile.png",
        maxLength: 500
    },
    about: {
        type: String,
        default: "Hey there! I am a Developer",
        maxLength: 500
    },
    skills: {
        type: [String],
        maxLength: 100
    }

    }, { timestamps: true });

module.exports = mongoose.model("User", userSchema);