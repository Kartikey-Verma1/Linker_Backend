const express = require("express");
const userAuth = require("../middlewares/userAuth.js");
const Request = require("../models/request.model.js");
const User = require("../models/user.model.js");
const createError = require("../utils/createError.js");

const requestRouter = express.Router();

requestRouter.post("/connectionRequest/send/:status/:receiverId", userAuth, async (req, res)=>{
    try{
        const status = req.params.status;
        const receiverId = req.params.receiverId;
        const senderId = req.user._id;

        if(!["interested", "ignored"].includes(status)){
            throw createError(400, "invalid status", {causion: `${status} is not allowed`});
        }

        const isAvailable = await Request.findOne({
            $or: [
                {senderId, receiverId},
                {senderId: receiverId, receiverId: senderId}
            ]
        });
        if(isAvailable) {
            throw createError(400, "request not allowed", {
                reason: "request already present",
                requestStatus: isAvailable.status
            });
        }

        const receiverUser = await User.findById(receiverId);
        if(!receiverUser){
            throw createError(404, "User not found!");
        }

        const request = new Request({
            senderId,
            receiverId,
            status
        });
        await request.save();

        res.json({
            message: `${req.user.firstName} put ${status} on ${receiverUser.firstName}`,
            data: request
        })
    }
    catch (err){
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});

requestRouter.post("/connectionRequest/review/:status/:userId", userAuth, async (req, res)=>{
    try {    
        const {status, userId} = req.params;
        if(!["accepted", "rejected"].includes(status)){
            throw createError(400, "Invalid Status!");
        }

        const request = await Request.findOne({
            senderId: userId,
            receiverId: req.user._id,
            status: "interested"
        });
        if(!request){
            throw createError(404, "Request not found!");
        }

        request.status = status;
        const data = await request.save();

        res.json({
            message: `You ${status} the request`,
            data: data
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});

module.exports = requestRouter; 