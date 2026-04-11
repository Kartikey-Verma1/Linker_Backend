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
        maxLength: 15,
        trim: true,
        validator(value){
            if(value.length != 0 && value.length < 4){
                throw createError(409, "Length of lastname can be between 4 to 15.")
            }
        }
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
        min: 16,
        required: true
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
        default: "Hey there! I am on Linker.",
        trim: true,
        maxLength: 200,
    },
    skills: {
        type: [String],
        lowercase: true,
        trim: true,
        validate(value){
            if(value.length > 20){
                throw createError(400, "Number of skills exceedes limit of 20");
            }
            value.forEach(element => {
                if(element?.length > 20) throw createError(400, "Length of skill cannot be more than 20");
            });
        }
    },
    photourl:{
        type: String,
        default: "https://i.pinimg.com/474x/30/81/11/308111056142497974b0a6d43ab5efaf.jpg",
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
    const token = await jwt.sign({_id: this._id}, "Linker@123#", {
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