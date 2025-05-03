import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    title:{
        type:String,
        unique:true,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true});

const Category = mongoose.model("Category",categorySchema);
export default Category;