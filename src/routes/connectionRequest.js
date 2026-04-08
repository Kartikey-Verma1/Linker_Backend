const express = require("express");
const userAuth = require("../middlewares/userAuth.js");
const Request = require("../models/request.model.js");
const User = require("../models/user.model.js");
const createError = require("../utils/createError.js");
const { isValidObjectId } = require("mongoose");

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

        const receiverUser = await User.findById(receiverId)
        .select("firstName")
        .lean();

        if(!receiverUser){
            throw createError(404, "User not found!");
        }

        if(isAvailable) {
            if(["interested", "accepted"].includes(isAvailable.status)){
                throw createError(400, "request not allowed", {reason: `already ${isAvailable.status}`});
            }
            if(status === "ignored"){
                throw createError(400, "request not allowed", {reason: "interaction already present"})
            }
            if(isAvailable.senderId.toString() === senderId.toString() && isAvailable.status === "rejected"){
                const diff = Math.ceil((Date.now() - isAvailable.updatedAt.getTime()) / (1000 * 60 * 60 * 24));

                if(diff < 30) throw createError(429, `Try again after ${30 - diff} days`, {reason: "30 days cooldown not expired"});
            }

            if(isAvailable.status === "withdrawn"){
                const diff = ((Date.now() - isAvailable.updatedAt.getTime()) / 1000);
                if(diff < 10){
                    throw createError(429, "Too Many Attempts");
                }
            }

            isAvailable.senderId = senderId;
            isAvailable.receiverId = receiverId;
            isAvailable.status = status;

            await isAvailable.save();

            return res.json({
                message: `${req.user.firstName} is ${status} in ${receiverUser.firstName}`,
                data: {
                    _id: isAvailable._id,
                    senderId: isAvailable.senderId,
                    receiverId: isAvailable.receiverId,
                    status: isAvailable.status
                }
            });
            
        }

        const request = new Request({
            senderId,
            receiverId,
            status
        });
        await request.save();

        res.json({
            message: `${req.user.firstName} put ${status} on ${receiverUser.firstName}`,
            data: {
                _id: request._id,
                senderId: request.senderId,
                receiverId: request.receiverId,
                status: request.status
            }
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

requestRouter.post("/connectionRequest/withdraw/interaction/:id", userAuth, async (req, res)=>{
    try{
        const {id} = req.params;
        if(!id) throw createError(404, "Id not found");
        if(!isValidObjectId(id)) throw createError(400, "Invalid Object Id");
        
        const interaction = await Request.findOne({
            $or: [
                {
                    senderId: req.user._id,
                    receiverId: id,
                },
                {
                    senderId: id,
                    receiverId: req.user._id
                }
            ]
        })
        .select(["_id", "senderId", "receiverId", "status"]);

        if(!interaction){
            throw createError(404, "Request not found");
        }
        
        if(interaction.status === "ignored" || interaction.status === "rejected") throw createError(400, "Interaction withdraw not allowed");

        if(interaction.status === "interested"){
            if(interaction.senderId.toString() !== req.user._id.toString()) throw createError(400, "Interaction withdraw not allowed");
        }
        
        const prevStatus = interaction.status;

        interaction.status = "withdrawn";
        await interaction.save();

        let message = "Request withdrawn successfully";
        if(prevStatus === "accepted") message = "Connection removed successfully";
        res.json({message});
    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});

module.exports = requestRouter; 