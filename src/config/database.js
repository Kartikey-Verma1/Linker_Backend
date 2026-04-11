const {mongoose} = require("mongoose");

const connectDB = async ()=>{
    await mongoose.connect("mongodb+srv://kartikv7391:kartikeyverma13022006@linker0.qtqej61.mongodb.net/Linker");
};

module.exports = connectDB;