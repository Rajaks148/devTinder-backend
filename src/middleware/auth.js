
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const cookie = req.cookies;
        const { token } = cookie;

        if(!token) {
            throw new Error("Token error.");
            
        }

        const decodedObj = await jwt.verify(token, "DEV@Tinder$148")
        const { _id }  = decodedObj;
        
        const user = await User.findById(_id);

        if(!user) {
            throw new Error("Error: Invalid Token!");
        } 

        req.user = user;
        next();

        } catch(err) {
            res.status(400).send("Error:"+err.message);
        }
};  


module.exports = {
    userAuth
};