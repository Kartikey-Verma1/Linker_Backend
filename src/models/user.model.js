const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const createError = require("../utils/createError.js");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 15,
        trim: true,
    },
    lastName: {
        type: String,
        minLength: 4,
        maxLength: 15,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        immutable: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw createError(400, "Invalid Email");
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw createError(400, "Password must include 1 capital case, 1 small case, 1 special character, 1 number and minimum length of 8");
            }
        }
    },
    age: {
        type: Number,
        max: 70,
        min: 16
    },
    gender: {
        type: String,
        lowercase: true,
        trim: true,
        enum: {
            values: ["male", "female", "others"],
            message: `{VALUE} is not a valid gender`
        }
    },
    about: {
        type: String,
        default: "Hey there! I am on DevTinder.",
        trim: true,
        maxLength: 100,
    },
    skills: {
        type: [String],
        lowercase: true,
        trim: true,
        validate(value){
            if(value.length > 20){
                throw createError(400, "Number of skills exceedes limit of 20");
            }
        }
    },
    photourl:{
        type: String,
        default: "https://www.vhv.rs/viewpic/ioJThwo_men-profile-icon-png-image-free-download-searchpng/",
        validate(value){
            if(!validator.isURL(value)){
                throw createError(400, "Enter valid url");
            }
        }
    }
}, {
    timestamps: true,
});

userSchema.pre("save", async function(){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
});

userSchema.methods.getJWT = async function () {
    const token = await jwt.sign({_id: this._id}, "DevTinder@123#", {
        expiresIn: "1d"
    });
    return token;
};

userSchema.methods.verifyPassword = async function (password) {
    const isValid = await bcrypt.compare(password, this.password);
    return isValid;
};
const User = mongoose.model("User", userSchema);

module.exports = User;