const mongoose =require("mongoose");
const encSchema=mongoose.Schema({
    id:String,
    password:String
},{
    versionKey:false
})

const EncModel=mongoose.model("enc",encSchema);

module.exports={EncModel};