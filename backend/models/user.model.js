import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required: true,
        unique: true,
    },
    fullName : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true,
        minLength: 6
    },
    email : {
        type : String,
        required : true,
        unique : true,
        
    }
})