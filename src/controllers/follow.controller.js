import Follow from "../models/follow.model.js";
import User from "../models/user.model.js";

//follow a user
const follow = async(req,res)=>{
    try {
        const follower = req.user?._id;
        if(!follower){
            return res.status(400).json({
                message:"FollowerId is required to follow the user!",
                success:false
            });
        }
        const {following} = req.body;
        if(!following){
            return res.status(400).json({
                message:"User to follow is required!",
                success:false
            });
        }

        if(following.toString() === follower.toString()){
            return res.status(400).json({
                message:"You can't follow yourself!",
                success:false
            });
        }

        const existingFollower = await Follow.findOne({follower,following});
        if(existingFollower){
            return res.status(400).json({
                message:"You are already follow this user!",
                success:false
            });
        }
        // const followedUser = await User.findByIdAndUpdate(follower,{
        //     $push:{
        //         following
        //     }
        // },{new:true});

        // const followingUser = await User.findByIdAndUpdate(following,{
        //     $push:{
        //         follower
        //     }
        // },{new:true});
       
       const follow = await Follow.create({
        follower,
        following
       })
       if(!follow){
        return res.status(400).json({
            message:"Something Went wrong while follow to user",
            success:false
        })
       }
        return res.status(201).json({
        message:"User followed successfully!",
        success:true,
        data:follow
       })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal Server Error! "+error.message,
            success:true
        })
    }
}
//unfollow a user
const unFollow = async(req,res)=>{
    try {
        const follower = req.user?._id;
        if(!follower){
            return res.status(400).json({
                message:"followerId is required to unfollow a user!",
                success:false
            });
        }

        const {following} = req.body;
        if(!following){
            return res.status(400).json({
                message:"followingId is required to unfollow a user!",
                success:false
            });
        }
        const existingFollowuing = await Follow.findOneAndDelete({follower,following});
        if(!existingFollowuing || existingFollowuing.length === 0){
            return res.status(400).json({
                message:"You have already unfollow this user",
                success:false
            });
        }

        return res.status(200).json({
            message:"User unfollow successfully!",
            success:true,
            data:existingFollowuing
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal Server Error! "+error.message,
            success:true
        })
    }
}
//get all followers of a user
const followers = async(req,res)=>{
    try {
        const userId = req.params.userId;
        if(!userId){
            return res.status(400).json({
                message:"UserId is required to fetch all the followers",
                success:false
            });
        }
        const followers = await Follow.find({following:userId}).populate("follower");
        if(!followers || followers.length === 0){
            return res.status(400).json({
                message:"You don't have any followers",
                success:false
            });
        }
        return res.status(200).json({
            message:"All Followers Found Successfully!",
            success:true,
            data:followers
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal Server Error! "+error.message,
            success:true
        })
    }
}
//get all following(user is following)
const following = async(req,res)=>{
    try {
        const userId = req.params.userId;
        console.log(userId);
        if(!userId){
            return res.status(400).json({
                message:"FollowerId is required to see all following Users",
                success:false
            });
        }
        const following = await Follow.find({follower:userId}).populate({path:"following",select:"userName fullName email avatar coverImage"});
        if(!following || following.length === 0){
            return res.status(400).json({
                message:"You don't following any user!"
            });
        }
        return res.status(200).json({
            message:"All following users found successfully!",
            success:true,
            data:following
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Internal Server Error! "+error.message,
            success:true
        })
    }
}

export {
    follow,
    unFollow,
    followers,
    following
}



