import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { deleteFromCLoudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

//create post
const createPost = async (req, res) => {
    const { title, content, category } = req.body;
    if (!title || !content) {
        return res.status(400).json({
            message: "All These Feilds are required!",
            success: false,
        });
    }
    const author = req.user._id;
    if (!author) {
        return res.status(400).json({
            message: "Author is required to create the post!",
            success: false,
        });
    }
    const imageLocalPath = req.file?.path;
    if (!imageLocalPath) {
        return res.status(402).json({
            message: "Image file is missing!",
            success: false,
        });
    }
    let image;
    try {
        image = await uploadOnCloudinary(imageLocalPath);
        if (!image) {
            return res.status(402).json({
                message: "Something went wronge while uploading image on cloudinay!",
                success: false,
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server error!",
            success: false,
        });
    }
    try {
        const post = await Post.create({
            title,
            content,
            category,
            author,
            image: {
                url: image.url,
                publicId: image.public_id
            }
        });
        if (!post) {
            return res.status(402).json({
                message: "Something went wronge while creating the post!",
                success: false,
            });
        }
        return res.status(402).json({
            message: "Post Created Successfully!",
            success: true,
            data: post
        });
    } catch (error) {
        if (image) {
            await deleteFromCLoudinary(image.public_id);
        }
        console.error(error);
        return res.status(500).json({
            message: "Internal Server error!" + error.message,
            success: false,
        });
    }
}

//find all posts
const allPost = async (req, res) => {
    try {
        const posts = await Post.find();
        if (!posts) {
            return res.status(404).json({
                message: "No posts found!",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Posts found successfully!",
            success: true,
            data: posts
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server error!" + error.message,
            success: false,
        })
    }
}
//get single post
const singlePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        if (!postId) {
            return res.status(400).json({
                message: "PostId is required!",
                success: false,
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(400).json({
                message: "Something went wrong while fetching the single post!",
                success: false
            })
        }
        post.views += 1;
        await post.save();
        return res.status(200).json({
            message: "post fetched successfully!",
            success: true,
            data: post
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server error!" + error.message,
            success: false,
        });
    }
}

//update post 
const updatePost = async (req, res) => {
    try {
        const user = req.user?._id;
        if (!user) {
            return res.status(400).json({
                message: "userId is required!",
                success: false
            });
        }
    
        const existingUser = await User.findById(user);
        if (!existingUser) {
            return res.status(400).json({
                message: "User not found!",
                success: false
            });
        }
    
        if (existingUser.role !== "Admin" && existingUser?._id.toString() !== user.toString()) {
            return res.status(400).json({
                message: "You are not authorized to update this post!",
                success: false
            });
        }
    
        const postId = req.params.postId;
        if (!postId) {
            return res.status(400).json({
                message: "postId ids required!",
                success: false
            });
        }

        const {title,content,category} = req.body;
        if(!title || !content || !category){
            return res.status(400).json({
                message:"All these feilds are required!",
                success:false
            });
        }

        const post = await Post.findByIdAndUpdate(postId,{
            title,
            content,
            category
        },{new:true});

        if(!post){
            return res.status({
                message:"Something went wrong while updating the post!",
                success:false
            });
        }

        return res.status(200).json({
            message:"Post updated successfully!",
            success:"false",
            data:post
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server error!" + error.message,
            success: false,
        });
    }
}
//update post image
const updatePostImage = async (req, res) => {
    const user = req.user?._id;
    if (!user) {
        return res.status(400).json({
            message: "userId is required!",
            success: false
        });
    }

    const existingUser = await User.findById(user);
    if (!existingUser) {
        return res.status(400).json({
            message: "User not found!",
            success: false
        });
    }

    if (existingUser.role !== "Admin" && existingUser?._id.toString() !== user.toString()) {
        return res.status(400).json({
            message: "You are not authorized to update this image!",
            success: false
        });
    }

    const postId = req.params.postId;
    if (!postId) {
        return res.status(400).json({
            message: "postId ids required!",
            success: false
        });
    }
    const post = await Post.findById(postId);
    if(!post){
        return res.status(400).json({
            message:"Post not found!",
            success:false
        });
    }

    const oldImage = post.image;
    if(oldImage && oldImage.publicId){
       await deleteFromCLoudinary(oldImage.publicId);
    }

   const imageLocalPath = req.file?.path;
   if(!imageLocalPath){
    return res.status(400).json({
        message:"image is required!",
        success:false
    });
   }

   let image = await uploadOnCloudinary(imageLocalPath);
   if(!image){
    return res.status(400).json({
        message:"Something went wrong while uploading image on cloudinary!",
        success:false
    });
   }

    try {
     const newPost = await Post.findByIdAndUpdate(postId,{
        $set:{
            image:{
                url:image?.url,
                publicId:image?.public_id
            }
        }
     },{new:true});

     if(!newPost){
        return res.status(400).json({
            message:"Something Went wrong while updating the post image!",
            success:false
        });
     }

     return res.status(200).json({
        message:"Post Image Updated Successfully!",
        success:false,
        data:newPost
     })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server error!" + error.message,
            success: false,
        });
    }
}
//delete post
const deletePost = async (req, res) => {
    const user = req.user?._id;
    if(!user){
        return res.status(400).json({
            message:"User is required to delete this post!",
            success:false
        });
    }

    const existingUser = await User.findById(user);
    if (!existingUser) {
        return res.status(400).json({
            message: "User not found!",
            success: false
        });
    }

    if (existingUser.role !== "Admin" && existingUser?._id.toString() !== user.toString()) {
        return res.status(400).json({
            message: "You are not authorized to delete this post!",
            success: false
        });
    }

    const postId = req.params.postId;
    if(!postId){
        return res.status(400).json({
            message:"postId is required to delete this post!",
            success:false
        });
    }

    const post = await Post.findById(postId);
    if(!post){
        return res.status(400).json({
            message:"Post not found!",
            success:false
        });
    }

    const image = post?.image;
    if(image && image?.publicId){
        await deleteFromCLoudinary(image.publicId);
    }

    try {
        const deletePost = await Post.findByIdAndDelete(postId);
        if(!deletePost || deletePost.length === 0){
            return res.status(400).json({
                message:"Something went wrong while deleting the post!",
                success:false
            });
        }

        return res.status(200).json({
            message:"Post deleted successfully!",
            success:true,
            data:deletePost
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server error!" + error.message,
            success: false,
        });
    }
}
//get trending post based on likes
const trendingPost = async (req, res) => {
    try {

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server error!" + error.message,
            success: false,
        });
    }
}
export {
    createPost,
    allPost,
    singlePost,
    updatePost,
    updatePostImage,
    deletePost,
    trendingPost
}
