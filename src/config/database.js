const mongoose = require("mongoose");


const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://rajaks148_db_user:KFhAoqTebpy6HMBQ@cluster0.m5hlowe.mongodb.net/devTinder"
    );
};


module.exports = connectDB;

