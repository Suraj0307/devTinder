const mongoose = require('mongoose');

const connectDB = async() => {
    await mongoose.connect(
        "mongodb+srv://joshisuraj535:suraj1234@cluster0.c4qln1t.mongodb.net/devTinder"

    );
};

module.exports = 
{
    connectDB
};
