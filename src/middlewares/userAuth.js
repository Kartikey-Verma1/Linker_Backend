const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const createError = require("../utils/createError.js");

const userAuth = async (req, res, next)=>{
    try{
        const {token} = req.cookies;
        if(!token){
            throw createError(401, "Token not found");
        }
        const decoded = jwt.verify(token, "DevTinder@123#");
        const user = await User.findById(decoded._id)
        if(!user){
            throw createError(401, "Please login first");
        }
        req.user = user;
        next();
    } catch(err){
        if(err.name === "TokenExpiredError"){
            res.status(401).json({
                message: err.message,
            })
        }
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
}

module.exports = userAuth;