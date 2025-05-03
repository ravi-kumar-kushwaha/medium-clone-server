import SavedPost from "../models/savedPost.model.js";
import User from "../models/user.model.js";

//save post to read later
const savePost = async (req, res) => {
    try {
        const user = req.user?._id;
        if (!user) {
            return res.status(400).json({
                message: "UserId is required to save the post!",
                success: false
            });
        }
        const { post } = req.body;
        if (!post) {
            return res.status(400).json({
                message: "postId is required to save the post to read later!",
                success: false
            });
        }
        const existingPost = await SavedPost.findOne({ user, post });
        if (existingPost) {
            return res.status(400).json({
                message: "You have already saved this post!",
                success: false
            });
        }
        const savePost = await SavedPost.create({
            user,
            post
        });
        if (!savePost) {
            return res.status(400).json({
                message: "Something went wrong while trying to save this post!",
                success: false
            });
        }

        const updatedUser = await User.findByIdAndUpdate(user, {
            $push: {
                savedPosts: savePost?._id
            }
        }, { new: true });

        if (!updatedUser) {
            return res.status(400).json({
                message: "Something went wrong while adding post in savedPost!",
                success: false
            });
        }

        return res.status(201).json({
            message: "Post Saved Successfully!",
            success: true,
            data: updatedUser
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error! " + error.message,
            success: true
        });
    }
}
//remove saved post 
const removePost = async (req, res) => {
    try {
        const user = req.user?._id;
        if (!user) {
            return res.status(400).json({
                message: "UserId is required to remove the post!",
                success: false
            });
        }

        const { post:postId } = req.body;
        if (!postId) {
            return res.status(400).json({
                message: "postId is required to remove the post from savedPost!",
                success: false
            });
        }

        const savedPost = await SavedPost.findOneAndDelete({ user,post:postId });
        if (!savedPost) {
            return res.status(400).json({
                message: "You have already removed post from savedPost!",
                success: false
            });
        }

        const updatedUser = await User.findByIdAndUpdate(user, {
            $pull: {
                savedPosts: savedPost?._id
            }
        }, { new: true });
        if (!updatedUser) {
            return res.status(400).json({
                message: "Something went wrong while removing post from savedPost!",
                success: false
            });
        }

        return res.status(200).json({
            message: "Post removed successfully!",
            success: true,
            data: updatedUser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error! " + error.message,
            success: false
        });
    }
}

//fetch all saved post
const getAllSavedPost = async (req, res) => {
    try {
        const user = req.user?._id;
        if (!user) {
            return res.status(400).json({
                message: "UserId is required to save the post!",
                success: false
            });
        }

        const existinUser = await User.findById(user).
            populate({
                path: "savedPosts", populate: [
                    { path: "user", select: "userName fullName email" },
                    { path: "post", select: "-__v" }]
            }).
            sort({ createdAt: -1 });
        if (!existinUser || existinUser?.length === 0) {
            return res.status({
                message: "User Not Found!",
                success: false
            });
        }

        const savedPost = existinUser.savedPosts;
        if (!savedPost || savePost?.length === 0) {
            return res.status(404).json({
                message: "Saved Post Not Found!",
                success: false
            });
        }

        return res.status(200).json({
            message: "Saved Post Fetched Successfully!",
            success: true,
            data: savedPost
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error! " + error.message,
            success: true
        });
    }
}

export {
    savePost,
    removePost,
    getAllSavedPost
}