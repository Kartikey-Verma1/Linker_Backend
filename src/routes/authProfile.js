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
        const sameUser = await User.findOne({email});
        if(sameUser){
            throw createError(409, "User Already Exist!");
        }
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
            message: `${firstName} ${lastName} added successfully!`
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
            throw createError(401, "Invalid Email");
        }
        const user = await User.findOne({email: email})
        if(!user){
            throw createError(401, "User not registered");
        }
        
        const isPasswordValid = await user.verifyPassword(password);
        if(!isPasswordValid){
            throw createError(401, "Wrong email or password");
        }

        const token = await user.getJWT();
        res
        .cookie("token", token)
        .json({
            message: `${user.firstName} ${user.lastName} Logged In!`,
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                age: user.age,
                about: user.about,
                skills: user.skills,
                photourl: user.photourl,
                gender: user.gender
            }
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
        expires: new Date(Date.now()),
    })
    .json({
        message: "user logged out",
    });
});

module.exports = authRouter;