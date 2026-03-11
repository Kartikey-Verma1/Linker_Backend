const express = require("express");
const userAuth = require("../middlewares/userAuth");
const Request = require("../models/request.model");
const User = require("../models/user.model");
const userRouter = express.Router();

const SAFE_USER_DATA = ["firstName", "lastName", "age", "gender", "about", "photourl"];

userRouter.get("/user/requests/pending", userAuth, async (req, res)=>{
    try{
        const data = await Request.find({
            receiverId: req.user._id,
            status: "interested"
        })
        .populate("senderId", SAFE_USER_DATA);
        
        res.json({
            message: `data fetched successfully`,
            data: data
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});

userRouter.get("/user/connections", userAuth, async(req, res)=>{
    try{
        const connections = await Request.find({
            $or: [
                {senderId: req.user._id, status: "accepted"},
                {receiverId: req.user._id, status: "accepted"}
            ]
        })
        .populate("senderId", SAFE_USER_DATA)
        .populate("receiverId", SAFE_USER_DATA);

        const data = connections.map((row)=>{
            if(row.senderId._id.toString() === req.user._id.toString()){
                return row.receiverId;
            }
            return row.senderId;
        });

        res.json({data: data});
    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});

userRouter.get("/user/feed", userAuth, async (req, res)=>{
    try{
        const page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        limit = limit > 30 ? 30 : limit;
        const skip = (page - 1) * limit;

        const user = req.user;
        const connections = await Request.find({
            $or: [
                {senderId: user._id},
                {receiverId: user._id}
            ]
        }).select(["senderId", "receiverId"]);

        const feedEleminate = new Set();
        connections.forEach((element)=>{
            feedEleminate.add(element.senderId);
            feedEleminate.add(element.receiverId);
        });

        const feed = await User.find({
            _id: {$nin: Array.from(feedEleminate)}
        })
        .select(SAFE_USER_DATA)
        .skip(skip)
        .limit(limit);

        res.json({
            data: feed
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});
module.exports = userRouter;