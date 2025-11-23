const express = require("express");
const profileRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require('bcrypt');



profileRouter.patch("/profile/changePassword", userAuth, async (req, res) => {
    try {
        user = req.user;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        if(newPassword !== confirmPassword) {
            return res.json({
                status: 500,
                message: "Password & the confirm password not matched.",
            });
            
        } else {
            
            const isPasswordValid = await user.validatePassword(oldPassword);
            if(!isPasswordValid) {
                return res.json({
                    status: 500,
                    message: "Invalid Password."
                });
            } 
            const passwordHash = await bcrypt.hash(newPassword, 10);
            user.password = passwordHash;

            await user.save();

            return res.json({
                message: `${user.firstName} ${user.lastName}, your password updated successfully!`,
                data: user
            });
        }
    } catch(err) {
        res.json({
            status: 400,
            message: "Error while updating the password.",
        })
    }
    

});




profileRouter.get("/profile/view", userAuth,async (req,res) => {

    try {
        user = req.user;
        res.send(user);
    } catch(err) {
        res.status(400).send("Error while fetching the profile : "+err.message);
    }    
});


profileRouter.patch("/profile/edit", userAuth, async (req,res) => {
    try {
        if(!validateEditProfileData(req)) {
            throw new Error("Invalid edit request.");
        }
        const loggedInUser = req.user;
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key]);
        
        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName} ${loggedInUser.lastName} your profile updated successfully!`,
            data: loggedInUser
        }); 
    } catch(err) {
        res.status(400).send("Failed to update the user"+err.message);
    
    }
})


module.exports = profileRouter;