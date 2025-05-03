import { populate } from "dotenv";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";

const createComment = async (req, res) => {
    try {
        const user = req.user?._id;
        if (!user) {
            return res.status(400).json({
                message: "UserId is required to comment on post",
                success: true
            });
        }
        const { post: postId, content } = req.body;
        if (!postId) {
            return res.status(400).json({
                message: "postId is required to comment on post",
                success: true
            });
        }
        if (!content) {
            return res.status(400).json({
                message: "content is required to comment on post",
                success: true
            });
        }
        const existingComment = await Comment.findOne({ user, post: postId });
        if (existingComment) {
            return res.status(400).json({
                message: "you have already commented on this post",
                success: false
            })
        }
        const comment = await Comment.create({
            user,
            post: postId,
            content
        });
        if (!comment) {
            return res.status(500).json({
                message: "Something Went wrong while creating a comment!",
                success: false
            });
        }
        const updatedPost = await Post.findByIdAndUpdate(postId, {
            $push: {
                comment: comment._id
            }
        }, {
            new: true
        }).populate({ path: "comment", populate: [{ path: "user", select: "password" }, { path: "post" }] });
        if (!updatedPost) {
            return res.status(400).json({
                message: "Something Went wrong while updating the post!",
                success: false
            });
        }
        return res.status(201).json({
            message: "Comment Created Successfully",
            success: true,
            data: updatedPost
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error.message,
            success: fallse
        });
    }
}

//get all comments
const allComments = async (req, res) => {
    try {
        const allComments = await Comment.find().populate("user").select("-password").populate({ path: "likes", populate: [{ path: "user", select: "-password" }, { path: "comment" }] });
        if (!allComments) {
            return res.status(400).json({
                message: "Something Went wrong while fetching all comments",
                success: false
            });
        }
        return res.status(200).json({
            message: "allComments fetched successfully!",
            success: "true",
            data: allComments
        })
    } catch (error) {
        onsole.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error.message,
            success: fallse
        });
    }
}
//get single comment
const getSingleComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        if (!commentId) {
            return res.status(400).json({
                message: "commentId is required to get the single user!",
                success: false
            });
        }
        const singleComment = await Comment.findById(commentId).populate("user").select("-password");
        if (!singleComment) {
            return res.status(400).json({
                message: "Something went wrong while fetching the single User!",
                success: false
            });
        }
        return res.status(200).json({
            message: "comment fetched successfully!",
            success: true,
            data: singleComment
        })
    } catch (error) {
        onsole.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error.message,
            success: fallse
        });
    }
}
//update comment
const updateComment = async (req, res) => {
    try {
        const userId = req.user?._id;
        if(!userId){
            return res.status(400).json({
                message: "userId is required to update the comment!",
                success: false
            });
        }
        const commentId = req.params.commentId;
        if (!commentId) {
            return res.status(400).json({
                message: "commentId is required to update the comment!",
                success: false
            });
        }
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({
                message: "Content is required to for updating the comment!",
                success: false
            });
        }
        const comment = await Comment.findById(commentId);
        if(!comment || comment.length === 0){
            return res.status(404).json({
                message:"Comment not found!",
                success:false
            });
        }
        if(!comment?.user?.role === "admin" || !comment?.user?._id.toString() === userId.toString()){
            return res.status(402).json({
                message:"You are not authorized to update this comment!",
                success:false
            });
        }

        const updateComment = await Comment.findByIdAndUpdate(commentId, {
            content
        }, { new: true });
        if(!updateComment){
            return res.status(400).json({
                message:"Something went wrong while updating the comment",
                success:false
            });
        }
        return res.status(200).json({
            message:"Comment updated successfully!",
            success:true,
            data:updateComment
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error.message,
            success: false
        });
    }
}
//delete comment
const deleteComment = async (req, res) => {
    try {
        const userId = req.user?._id;
        if(!userId){
            return res.status(400).json({
                message: "userId is required to delete the comment!",
                success: false
            });
        }
        const commentId = req.params.commentId;
        if (!commentId) {
            return res.status(400).json({
                message: "commentId is required to delete the comment!",
                success: false
            });
        }
        const comment = await Comment.findById(commentId);
    
        if(!comment || comment.length === 0){
            return res.status(404).json({
                message:"Comment not found!",
                success:false
            });
        }
        if(!comment?.user?.role === "admin" || !comment?.user?._id.toString() === userId.toString()){
            return res.status(402).json({
                message:"You are not authorized to delete this comment!",
                success:false
            });
        }
       const deleteComment = await Comment.findByIdAndDelete(commentId);
       if(!deleteComment){
        return res.status(400).json({
            message:"You have already deleted this comment!",
            success:false
        });
       }
       const {post:postId} = req.body;
       if(!postId){
        return res.status(400).json({
            message: "postId is required to delete the comment!",
            success: false
        });
       }
       const updatedPost = await Post.findByIdAndUpdate(postId,{
        $pull:{
            comment:deleteComment._id
        }
       },{new:true}) ;
       if(!updatedPost){
        return res.status(400).json({
            message:"Something went wrong while updating the post!"
        })
       }
       return res.status(200).json({
        message:"Comment Deleted Successfully!",
        success:true,
        data:updatedPost
       });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error.message,
            success: fallse
        });
    }
}
export {
    createComment,
    allComments,
    getSingleComment,
    updateComment,
    deleteComment
}