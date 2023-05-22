const mongoose =require("mongoose");
const hashSchema=mongoose.Schema({
    id:String,
    password:String
},{
    versionKey:false
})

const HashModel=mongoose.model("hash",hashSchema);

module.exports={HashModel};