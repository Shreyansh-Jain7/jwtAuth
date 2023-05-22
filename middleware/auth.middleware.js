const jwt=require("jsonwebtoken");
require("dotenv").config();
const {UserModel}=require("../models/users.model");
const{BlackList}=require("../models/blacklist.model");

const auth=async(req,res,next)=>{
    try {
        const token=req.headers.authorization.split(" ")[1];
        const isblacklisted=await BlackList.findOne({token});
        if(isblacklisted){
            return res.status(400).send("Token is Blacklisted");
        }
        const decoded =jwt.verify(token,process.env.jwtsecret);
        const userId=decoded.userId;
        const user=await UserModel.findById(userId);
        if(!user){
            return res.status(400).send("Unauthorized");
        }
        if(req.url=="/blogs/add"){
            req.body.user=userId;
        }
        req.user=userId;
        next();
    } catch (error) {
        res.status(400).send({"msg":error.message});
    }
}

module.exports={auth};