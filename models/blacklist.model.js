const mongoose=require("mongoose");
const blackListSchema=new mongoose.Schema({
    token:String
},{
    versionKey:false
})

const BlackList=mongoose.model("blacklist",blackListSchema);

module.exports={BlackList};