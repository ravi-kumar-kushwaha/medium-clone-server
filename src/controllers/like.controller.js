import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import Post from "../models/post.model.js";
//like post
const likePost = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required to like the post",
                success: false
            });
        }

        const { post: postId } = req.body;
        if (!postId) {
            return res.status(400).json({
                message: "Post ID is required to like the post",
                success: false
            });
        }

        const existingLike = await Like.findOne({ user: userId, post: postId });
        if (existingLike) {
            return res.status(400).json({
                message: "You have already liked this post",
                success: false
            });
        }

        const likePost = await Like.create({
            user: userId, 
            post: postId 
        });
        if (!likePost) {
            return res.status(500).json({
                message: "Something went wrong while liking the post",
                success: false
            });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $push: { likes: likePost._id } },
            { new: true }
        ).populate({path:"likes",populate:[{path:"user" ,select:"-password"},{path:"post"}]});

        if (!updatedPost) {
            return res.status(500).json({
                message: "Something went wrong while updating post likes",
                success: false
            });
        }

        return res.status(201).json({
            message: "Post Liked Successfully",
            success: true,
            data: updatedPost
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error: " + error.message,
            success: false
        });
    }
};

//dislike post
const unlikePost = async(req,res)=>{
    try {
        const user = req.user?._id;
        if(!user){
            return res.status(400).json({
               message: "User ID is required to unlike the post",
               success: false
            })
        }
        const {post:postId} = req.body;
        if(!postId){
            return res.status(400).json({
               message: "postId ID is required to unlike the post",
               success: false
            })
        }
        const like = await Like.findOneAndDelete({user,post:postId});
        if(!like){
            return res.status(400).json({
                message: "You have already not liked this post",
                success: false
            });
        }
        const updatedPost = await Post.findByIdAndUpdate(postId,{
            $pull:{
                likes:like._id
            }
        })
        if (!updatedPost) {
            return res.status(500).json({
                message: "Something went wrong while updating unlike post",
                success: false
            });
        }

        return res.status(200).json({
            message: "Post unliked successfully!",
            success: true,
            data: updatedPost
        });
     } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error: " + error.message,
            success: false
        });
    }
}

//like comment
const likeComment = async(req,res)=>{
try {
    const user = req.user?._id;
    if(!user){
        return res.status(400).json({
            message:"UserId is required to liked the comment",
            success:false
        });
    }

    const {comment:commentId} = req.body;
    if(!commentId){
        return res.status(400).json({
            message:"commentId is required to liked the comment",
            success:false
        });
    }
   const existinglike = await Like.findOne({user,comment:commentId});
   if(existinglike){
    return res.status(400).json({
        message:"You have already liked this comment!",
        success:false
    });
   }
   const like = Like.create({
    user,
    comment:commentId,
   });
   if(!like){
    return res.status(500).json({
        message:"Something went wrong while liked on comment",
        success:false
    });
   }
   const updatedComment = await Comment.findByIdAndUpdate(commentId,{
    $push:{
        likes:(await like)._id
    }
   },{
    new:true
   }).populate({path:"likes",populate:[{path:"user",select:"-password"},{path:"comment"}]});
if(!updatedComment){
    return res.status(400).json({
        message:"Something went wrong while lupdating the comment",
        success:false
    })
}
return res.status(200).json({
    message:"Comment Liked Successfully!",
    success:true,
    data:updatedComment
})
} catch (error) {
    console.error(error);
        return res.status(500).json({
            message: "Internal Server Error: " + error.message,
            success: false
        });
}
}
//dislike comment
const dislikeComment = async(req,res)=>{
    try {
        const user = req.user?._id;
        if(!user){
            return res.status(400).json({
                message:"UserId is required to dislike the comment!",
                success:false
            });
        }
        const {comment:commentId} = req.body;
        if(!commentId){
            return res.status(400).json({
                message:"commentId is required to dislike the comment!",
                success:false
            });
        }
        const like = await Like.findOneAndDelete({user,comment:commentId});
        if(!like){
            return res.status(400).json({
                message:"You have already disliked the comment",
                success:false
            })
        }
        const updatedComment = await Comment.findByIdAndUpdate(commentId,{
            $pull:{
                likes:like._id
            }
        },{new:true});
        if(!updatedComment){
            return res.status(400).json({
                message:"Something went wrong while updating the commnet!",
                success:false
            })
        }
        return res.status(200).json({
            message:"Comment Disliked successfully!",
            success:true,
            data:updatedComment
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error: " + error.message,
            success: false
        });
    }
    }
export { 
    likePost,
    unlikePost,
    likeComment,
    dislikeComment
};
