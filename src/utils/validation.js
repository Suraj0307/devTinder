const validator = require("validator")


const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName) {
        throw new Error("First name and Last name are required.");
    }
    else if (firstName.length < 4 || firstName.length > 50) {
        throw new Error("First name must be between 4 and 50 characters.");
    }
    else if (lastName.length < 4 || lastName.length > 50) {
        throw new Error("Last name must be between 4 and 50 characters.");
    }
    else if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email format.");
    }
    else if (!validator.isStrongPassword(password)) {
        throw new Error("Password must be at least 6 characters long and contain a mix of letters, numbers, and symbols.");

    }
};

module.exports = { validateSignUpData };
