const express = require("express");
const connectDB = require("./config/database.js");
const User = require("./models/user.js");

const app = express();

connectDB()
.then(()=>{
    console.log("Database is connected successfully...");
    app.listen(3000, ()=>{
        console.log("server is running on port 3000");
    });

})
.catch((err)=>{
    console.error(`Database connection failed...: ${err}`);
});

app.use(express.json());

app.post("/signup", async (req, res)=>{
    const user = new User(req.body);
    try{
        await user.save();
        res.send("user added successfully!");
    } catch (err){
        res.status(400).send(`Error saving user: ${err}`);
    }
});

app.get("/user", async (req, res)=>{
    const userEmail = req.body.email;
    try{
        const users = await User.find({email: userEmail});
        if(users.length == 0){
            res.send("No such user exist");
        }
        else{
            res.send(users);
        }
    } catch (err){
        res.status(400).send("Something Went Wrong...");
    }
});

app.get("/feed", async (req, res)=>{
    try{
        const users = await User.find({});
        res.send(users);
    }
    catch{
        res.status(400).send("Something Went Wrong...");
    }
});