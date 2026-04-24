const express = require("express");
const userAuth = require("../middlewares/userAuth.js")
const validator = require("validator");
const Request = require("../models/request.model.js");
const {validateEditData, validateInputData} = require("../utils/validation.js");
const createError = require("../utils/createError.js");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res)=>{
    try{
        const user = req.user;
        res.json({
            message: "user profile information",
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                age: user.age,
                gender: user.gender,
                photourl: user.photourl,
                skills: user.skills,
                about: user.about
            }
        });
    } catch (err){
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    };
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try{
        validateInputData(req);
        validateEditData(req);
        const user = req.user;
        Object.keys(req.body).forEach((field)=> user[field] = req.body[field]);

        await user.save();
        res.json({
            message: `${user.firstName} your profile has been updated successfully!`,
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                age: user.age,
                gender: user.gender,
                photourl: user.photourl,
                skills: user.skills,
                about: user.about
            }
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});

profileRouter.patch("/profile/changePassword", userAuth, async (req, res) => {
    try{
        const user = req.user;
        const isValid = await user.verifyPassword(req.body.password);
        if(!isValid){
            throw createError(422, `Please enter correct old password!`);
        }
        if(!validator.isStrongPassword(req.body.newPassword)){
            throw createError(422, `Password must include 1 capital case, 1 small case, 1 special character, 1 number and minimum length of 8!`);
        }
        if(req.body.newPassword != req.body.confirmNewPassword){
            throw createError(422, `Confirm password should be same as new password!`);
        }
        user.password = req.body.newPassword;
        await user.save();

        res.json({
            message: `${user.firstName} your password has been changed successfully!`
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});

profileRouter.delete("/profile/deleteAccount", userAuth, async (req, res) => {
    try{
        const user = req.user;

        await Request.deleteMany({
            $or: [
                {senderId: req.user._id},
                {receiverId: req.user._id}
            ]
        });

        await user.deleteOne();

        res
        .cookie("token", null, {
            expires: new Date(Date.now()),
        })
        .json({
            message: `${user.firstName} your profile has been deleted!`
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message,
            data: err.data
        });
    }
});

module.exports = profileRouter;