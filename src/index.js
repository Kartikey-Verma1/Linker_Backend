const express = require("express");
const connectDB = require("./config/database.js");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authProfile.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/connectionRequest.js");
const userRouter = require("./routes/user.js");
const cors = require("cors");

const app = express();

require('dotenv').config();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

app.use("/", (err, req, res, next)=>{
    console.error(err);
    res.status(err.status || 500).json({
        message: "Something went wrong!"
    })
})

connectDB()
.then(()=>{
    console.log("Database is connected successfully...");
    app.listen(process.env.PORT, ()=>{
        console.log(`server is running on port ${process.env.PORT}`);
    });

})
.catch((err)=>{
    console.error(`Database connection failed...: ${err.message}`);
});