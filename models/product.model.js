const mongoose =require("mongoose");
const productSchema=mongoose.Schema({
    name:String,
    price:Number
},{
    versionKey:false
})

const ProductModel=mongoose.model("product",productSchema);

module.exports={ProductModel};