
const express = require('express');
const requestRouter = express.Router();
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionUserRequest");
const { userAuth } = require("../middleware/auth");


requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    
    try {

        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        //validate the toUserId exists..
        const toUserExists = await User.findById(toUserId);
        if(!toUserExists) {
            return res.json({
                stauts:400,
                message:"Invalid toUserId.",
            });
        }

        //validate same user send and request himeself..
        // if(fromUserId == toUserId) {
        //     return res.json({
        //         stauts:400,
        //         message:"Request not allowed.",
        //     });
        // }

        //validate there is an existing request..
        const requestExists = await ConnectionRequest.findOne({
            $or: [
                {fromUserId, toUserId},
                {fromUserId:toUserId, toUserId:fromUserId},
            ],
        })

        if(requestExists) {
            return res.json({
                stauts:400,
                message:"Connection request already exists.",
            });
        }

        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)) {
            return res.json({
                stauts:400,
                message:"Invalid status type."+status,
            });
        }


        const ConnectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const data = await ConnectionRequest.save();

        res.json({
            message:"Request sent successfully.",
            data
        });
    } catch(err) {
        res.json({
            status:400,
            message:"Failed to sending the request",
        });
        
    }
    
    
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const requestId = req.params.requestId;
        const status = req.params.status;

        const allowedStatus = ["accepted", "rejected"];
        if(!allowedStatus.includes(status)) {
            return res.json({
                stauts:400,
                message:"Invalid status type."+status,
            });
        }

        const chkRecordExists = await ConnectionRequest.findOne({
            _id: requestId,
            fromUserId: loggedInUserId,
            status: "interested"
        });

        if(!chkRecordExists) {
            return res.json({
                status:400,
                message:"Connection request not found.",
            });
        }

        ConnectionRequest.status = status;
        const data = await ConnectionRequest.save();

        res.json({
            message:`Connection request ${status} successfully.`,
            data
        });



    } catch(err) {
        res.json({
            status:400,
            message:"Failed to accepting the request",
        });
    }
})


module.exports = requestRouter;
