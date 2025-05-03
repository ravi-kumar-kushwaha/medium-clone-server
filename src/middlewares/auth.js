import jwt from 'jsonwebtoken'
import User from '../models/user.model.js';

const verifyToken = async(req,res,next)=>{
    const token  = req.cookies.access_token || req.header("Authorization"?.replace("Bearer ",""));
    if(!token){
        return res.status(404).json({
            message:"Unautherized User",
            success:false
        })
    }
try {
    const verify = jwt.verify(token,process.env.JWT_SECRET);

    const user = await User.findById(verify._id);
    if(!user){
        return res.status(404).json({
            message:"Un autherized user!",
            success:false
        })
    }
    req.user = user;
    next();
} catch (error) {
    return res.status(500).json({
        message:"Internal Server Error",
        success:false
    })
}
}

export default verifyToken;



