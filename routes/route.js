const express=require("express");
const router=express.Router();
const {EncModel}=require("../models/encrypt.model");
const {HashModel}=require("../models/hash.model");
const {UserModel}=require("../models/users.model");
const {BlackList}=require("../models/blacklist.model");
const {ProductModel}=require("../models/product.model")
const {auth}=require("../middleware/auth.middleware");

require("dotenv").config();
const crypto=require("crypto");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

//1.ENCRYPTION AND DECRYPTION

const vec=crypto.randomBytes(16);
const secret=crypto.randomBytes(32);
const cipher=crypto.createCipheriv("aes-256-cbc",secret,vec);


router.post("/encryptmypwd",async(req,res)=>{
    const {id,password}=req.body;
    let encPass=cipher.update(password,"utf-8","hex");
    encPass+=cipher.final("hex");
    try {
        const user=new EncModel({id,password:encPass});
        await user.save();
        res.status(200).send({"msg":"user has been saved with encrypted password"});
    } catch (error) {
        res.status(400).send({"msg":error})
    }
})

router.get("/getmypwd",async(req,res)=>{
    let id=req.query.id;
    try {
        const user= await EncModel.find({id});
        console.log(user[0].password);
        if(user.length>0){
            const decipher=crypto.createDecipheriv("aes-256-cbc",secret,vec);
            decipher.setAutoPadding(false);
            let decPass=decipher.update(user[0].password,"hex","utf-8");
            decPass+=decipher.final("utf-8");
            res.status(200).send({"password":decPass});
        }else{
            res.status(400).send({"msg":"user not found"});
        }
    } catch (error) {
        res.status(400).send({"msg":error})
    }
})

//2. HASH AND VERIFY

router.post("/hashmypwd",async(req,res)=>{
    const {id,password}=req.body;
    try {
        bcrypt.hash(password,10,async(err,hash)=>{
            const user=new HashModel({id,password:hash});
            await user.save();
            res.status(200).send({"msg":"user has been saved with hashed password"});
        })
    } catch (error) {
        res.status(400).send({"msg":error})
    }
})

router.post("/verifymypwd",async(req,res)=>{
    const {id,password}=req.body;
    try {
        const user= await HashModel.find({id});
        if(user.length>0){
            bcrypt.compare(password,user[0].password,(err,result)=>{
                if(result){
                    res.status(200).send({"msg":"true"});
                }else{
                    res.status(200).send({"msg":"false"});
                }
            })
        }
    } catch (error) {
        res.status(400).send({"msg":error})
    }
})

//3.JWT AUTHORIZATION

router.post("/signup",async(req,res)=>{
    const {username,password}=req.body;
    try {
        const user=await UserModel.find({username});
        if(user.length==0){
            bcrypt.hash(password,5,async(err,hash)=>{
                const new_user=new UserModel({username,password:hash});
                await new_user.save();
                res.status(200).send({"msg":"User has been added"});
            })
        }else{
            res.status(400).send({"msg":"User already exists. Try another username"});
        }
    } catch (error) {
        res.status(400).send({"msg":error.message});
    }
})

router.post("/login",async(req,res)=>{
    const {username,password}=req.body
    try {
        const user=await UserModel.find({username});
        if(user.length>0){
            bcrypt.compare(password,user[0].password,(err,result)=>{
                if(result){
                    const token=jwt.sign({userId:user[0]._id},process.env.jwtsecret,{expiresIn:60});
                    const refresh=jwt.sign({userId:user[0]._id},process.env.refreshsecret,{expiresIn:300});
                    res.status(200).send({"msg":"Login Successful","token":token,"refreshToken":refresh})
                }else{
                    res.status(400).send({"msg":"Wrong credentials"})
                }
            })
        }else{
            res.status(400).send({"msg":"Wrong credentials"})
        }
    } catch (error) {
        res.status(400).send({"msg":error.message});
    }
})

router.post("/logout",async(req,res)=>{
    try {
        const token=req.headers.authorization.split(" ")[1];
        const blacklisted=new BlackList({token});
        await blacklisted.save();
        res.status(200).send({"msg":"Logged Out"})
    } catch (error) {
        res.status(400).send({"msg":error.message});
    }
})

router.post("/refresh",async(req,res)=>{
    const {username,refresh}=req.body;
    try {
        const decoded=jwt.verify(refresh,process.env.refreshsecret);
        const user= await UserModel.find({username});

        if(user.length>0 && user[0]._id==decoded.userId){
            const token=jwt.sign({userId:user[0]._id},process.env.jwtsecret,{expiresIn:60});
            res.status(200).send({"newToken":token});
        }else{
            res.status(400).send({"msg":"Unauthorized"});
        }
    } catch (error) {
        res.status(400).send({"msg":error.message});
    }
})

router.get("/products",auth,async(req,res)=>{
    try {
        const products=await ProductModel.find();
        res.status(200).send(products);
    } catch (error) {
        res.status(400).send({"msg":error.message});
    }
})

router.post("/addproducts",async(req,res)=>{
    try {
        const pro=new ProductModel(req.body);
        await pro.save();
        res.status(200).send({"msg":"product added"});
    } catch (error) {
        res.status(400).send({"msg":error.message});
    }
})

router.delete("/deleteproducts/:id",async(req,res)=>{
    const _id=req.params.id;
    try {
        await ProductModel.findByIdAndDelete({_id});
    } catch (error) {
        res.status(400).send({"msg":error.message});
    }
})



module.exports={router};