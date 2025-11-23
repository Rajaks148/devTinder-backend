const express = require("express");
const authRouter = express.Router();
const { validateSignup } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require('bcrypt');

authRouter.post("/signup", async (req,res) => {
    try {
        validateSignup(req);

        const { firstName, lastName, emailId, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        });
        
        await user.save();
        res.send("User added successfully.");
    } catch(err) {
        res.status(400).send("User data not inserted"+err.message);
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({emailId:emailId});
        if(!user) {
            throw new Error("Invalid credentials.");
            
        }

        const isPasswordValid = await user.validatePassword(password);
        if(!isPasswordValid) {
            throw new Error("Invalid credentials.");
        } else {
            const token = await user.getJWT();
                
           res.cookie("token", token, {
                maxAge: 8 * 3600000,  // 8 hours
                httpOnly: true,
                sameSite: "lax",
            });
            res.json({
                message:"Loggedin successfully",
                data:user
            }); 
        }
        

    } catch(err) {
        res.status(400).send(err.message);
    }
});

authRouter.post("/logout", (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("Logout successfully"); 
});


module.exports = authRouter;