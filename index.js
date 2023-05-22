const express=require("express");
const {connection}=require("./db");
require("dotenv").config();
const app=express();
const {router}=require("./routes/route")
app.use(express.json());



app.get("/",(req,res)=>{
    res.send("welcome");
})

app.use("/",router);

app.listen(process.env.port,async()=>{
    try {
        await connection;
        console.log("connected to mongodb at port 7700")
    } catch (error) {
        console.log(error);
    }
})