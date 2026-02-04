const {mongoose} = require("mongoose");

const connectDB = async ()=>{
    await mongoose.connect("mongodb+srv://kartikv7391_db_user:kartik.v13022006@cluster0.h2r2fsy.mongodb.net/devTinder");
};

module.exports = connectDB;