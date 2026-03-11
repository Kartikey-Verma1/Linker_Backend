const express = require("express");
const User = require("../models/user.model.js");
const validator = require("validator");
const { validateInputData } = require("../utils/validation.js");
const createError = require("../utils/createError.js");

const authRouter = express.Router();

authRouter.post("/authProfile/signup", async (req, res)=>{
    try{
        validateInputData(req);
        const {firstName, lastName, email, password, age, gender, about, skills, photourl} = req.body;
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            age,
            gender,
            about,
            skills,
            photourl
        });
        await user.save();
        res.json({
            message: "user added successfully!",
            data: user
        });
    } catch (err){
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});

authRouter.post("/authProfile/login", async (req, res)=>{
    try{
        const {email, password} = req.body;
        if(!validator.isEmail(email)){
            throw createError(400, "Invalid Email");
        }
        const user = await User.findOne({email: email});
        if(!user){
            throw createError(400, "User not registered");
        }
        
        const isPasswordValid = await user.verifyPassword(password);
        if(!isPasswordValid){
            throw createError(400, "Wrong email or password");
        }

        const token = await user.getJWT();
        res
        .cookie("token", token)
        .json({
            message: `${user.firstName} ${user.lastName} Logged In!`,
            data: user
        });
    } catch(err){
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});

authRouter.post("/authProfile/logout", async(req, res) => {
    res
    .cookie("token", null, {
        expires: new Date(Date.now())
    })
    .json({
        message: "user logged out",
    });
});

module.exports = authRouter;