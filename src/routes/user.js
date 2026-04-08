const express = require("express");
const userAuth = require("../middlewares/userAuth");
const Request = require("../models/request.model");
const User = require("../models/user.model");
const { isValidObjectId } = require("mongoose");
const createError = require("../utils/createError");
const userRouter = express.Router();

const SAFE_USER_DATA_VIEW = ["_id", "firstName", "lastName", "age", "gender", "about", "photourl", "skills"];
const SAFE_USER_DATA_LIST = ["_id", "firstName", "lastName", "photourl"];

userRouter.get("/user/requests/pending", userAuth, async (req, res)=>{
    try{
        const data = await Request.find({
            receiverId: req.user._id,
            status: "interested"
        })
        .select(["_id", "senderId", "status"])
        .populate("senderId", SAFE_USER_DATA_LIST);
        
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

userRouter.get("/user/requests/sent", userAuth, async (req, res)=>{
    try{
        const fetchedData = await Request.find({
            senderId: req.user._id,
            status: "interested"
        })
        .select(["_id", "receiverId", "status"])
        .populate("receiverId", SAFE_USER_DATA_LIST);
    
        res.json({
            message: "Data fetched successfully",
            data: fetchedData
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
})

userRouter.get("/user/connections", userAuth, async(req, res)=>{
    try{
        const connections = await Request.find({
            $or: [
                {senderId: req.user._id, status: "accepted"},
                {receiverId: req.user._id, status: "accepted"}
            ]
        })
        .select(["_id", "senderId", "receiverId", "status"])
        .populate("senderId", SAFE_USER_DATA_LIST)
        .populate("receiverId", SAFE_USER_DATA_LIST);

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
        const Id = req.query.Id;
        if(Id){
            if(!isValidObjectId(Id)){
                throw createError(400, "Invalid object id");
            }
        }
        
        let limit = parseInt(req.query.limit) || 30;
        limit = limit > 30 ? 30 : limit;

        const user = req.user;
        const connections = await Request.find({
            $or: [
                {
                    senderId: user._id,
                    status: {$in: ["interested", "accepted", "rejected", "withdrawn"]}
                },
                {
                    receiverId: user._id,
                    status: {$in: ["interested", "accepted"]}
                }
            ]
        }).select(["senderId", "receiverId"]);

        const feedEliminate = new Set();
        connections.forEach((element)=>{
            feedEliminate.add(element.senderId.toString());
            feedEliminate.add(element.receiverId.toString());
        });
        feedEliminate.add(user._id.toString());

        const query = {
            _id: {
                $nin: Array.from(feedEliminate)
            }
        }
        if(Id){
            query._id.$gt = Id;
        }
        const feed = await User.find(query)
        .sort({_id: 1})
        .select(SAFE_USER_DATA_VIEW)
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

userRouter.get("/user/profile/view/:id", userAuth, async (req, res)=>{
    try{
        const { id } = req.params;
        if(!isValidObjectId(id)){
            throw createError(400, "Invalid object id");
        }
        const fetchedUser = await User.findById(id)
            .select(SAFE_USER_DATA_VIEW)
            .lean();
        
        const fetchedRequest = await Request.findOne({
            $or: [
                {
                    senderId: id,
                    receiverId: req.user._id
                },
                {
                    senderId: req.user._id,
                    receiverId: id
                }
            ]
        })
        .select(["senderId", "receiverId", "status"])
        .lean();
        
        if(!fetchedUser){
            throw createError(404, "User Not Found");
        }
        const {_id, firstName, lastName, age, gender, about, photourl, skills} = fetchedUser;
        res.json({
            message: "requested profile!",
            data: {
                _id, firstName, lastName, age, gender, about, photourl, skills, interaction: fetchedRequest
            }
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});
module.exports = userRouter;