import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        minlength:4,
        maxlength:50,
    },
    fullName:{
        type:String,
        required:true,
        minlength:4,
        maxlength:50,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    coverImage:{
        url:{
            type:String,
            required:true
        },
        publicId:{
            type:String,
            required:true
        }
    },
    avatar:{
        url:{
            type:String,
            required:true
        },
        publicId:{
            type:String,
            required:true
        }  
    },
    bio:{
        type:String,
        maxlength:250
    },
    savedPosts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SavedPost",
    }],
    // subscriptions: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Subscription"
    //     }
    //   ],
    role:{
        type:String,
        enum:["Admin","User"],
        default:"User"
    },
},

{timestamps:true}
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) 
    return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.isPasswordMatched = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJwtToken = function () {
    return jwt.sign({
         _id: this._id,
         userName: this.userName,
         fullName: this.fullName ,
         email: this.email,
         avatar: this.avatar,
         coverImage: this.coverImage,
         role: this.role
        }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    });
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    }, process.env.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES
    })
}

const User = mongoose.model("User",userSchema);

export default User;