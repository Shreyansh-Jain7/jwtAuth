const mongoose =require("mongoose");
const userSchema=mongoose.Schema({
    username:String,
    password:String
},{
    versionKey:false
})

const UserModel=mongoose.model("user",userSchema);

module.exports={UserModel};