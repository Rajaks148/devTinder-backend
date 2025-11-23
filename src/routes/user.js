
const express = require('express');
const userRouter = express.Router();
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionUserRequest");
const { userAuth } = require("../middleware/auth");

const USER_SAFE_DATA = "firstName lastName photoUrl skills about age gender";


userRouter.get("/user/requests/:status", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const status = req.params.status;
        const data = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: status
        }).populate(
            "fromUserId", 
            USER_SAFE_DATA
        );
        if(!data) {
           return res.json({
            status : 400,
            message: `No ${status} requests found.`
        });
        }
        return res.json({
            message: `${status} requests fetched successfully.`,
            data
        });
    } catch(err) {
        return res.json({
            status : 400,
            message: "Failed to fetching the requests."
        })
    }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        const data = await ConnectionRequest.find({
            $or: [
                {fromUserId: loggedInUser},
                {toUserId:loggedInUser},
            ],
            status:"accepted"
        }).populate(
            "fromUserId", 
            USER_SAFE_DATA
        ).populate(
            "toUserId", 
            USER_SAFE_DATA
        )

        if(data.length == 0) {
            return res.json({
                status: 400,
                message: "No connections found."
            })
        }

        const result = data.map((row) => {
            if(row.fromUserId._id.toString() == loggedInUser.toString()){
                return row.toUserId;
            }
            return row.fromUserId;
        });

        return res.json({
                message: "Connections fetched successfully.",
                data:result
            });


    } catch(err) {
        return res.json({
            status : 400,
            message: "Failed to fetching the connections."
        })
    }
});


userRouter.get("/user/feed", userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Pagination inputs
        const page = parseInt(req.query.page) || 1;     // default page = 1
        const limit = parseInt(req.query.limit) || 10;  // default limit = 10
        const skip = (page - 1) * limit;

        // Step 1: Get all excluded user IDs
        const excludedRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUserId },
                { toUserId: loggedInUserId }
            ],
            status: { $in: ["accepted", "rejected", "ignored", "interested"] }
        });

        // Step 2: Build exclusion list (both sides)
        let excludedUserIds = excludedRequests.flatMap(req => [
            req.fromUserId.toString(),
            req.toUserId.toString()
        ]);
        excludedUserIds.push(loggedInUserId.toString()); // exclude myself

        // Step 3: Fetch paginated feed users
        const feedUsers = await User.find({
            _id: { $nin: excludedUserIds }
        })
        .skip(skip)
        .limit(limit);

        // Step 4: Count total remaining users (for pagination UI)
        const totalUsers = await User.countDocuments({
            _id: { $nin: excludedUserIds }
        });

        return res.json({
            status: 200,
            message: "Feed fetched successfully",
            data: feedUsers,
            pagination: {
                page,
                limit,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                hasNextPage: skip + limit < totalUsers,
                hasPrevPage: page > 1
            }
        });

    } catch (err) {
        console.error(err);
        res.json({
            status: 400,
            message: "Error while fetching the feeds."
        });
    }
});



module.exports = userRouter;