import User from "../models/user.model.js";
import { deleteFromCLoudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = async (req, res) => {
    const { userName, fullName, email, password } = req.body;
    if (!userName || !fullName || !email || !password) {
        return res.status(400).json({
            message: "All fields are required",
            success: false
        })
    }
    //check existing user
    const user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({
            message: "User already exists with this email address",
            success: false
        })
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        return res.status(400).json({
            message: "Avatar is required",
            success: false
        })
    }
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!coverImageLocalPath) {
        return res.status(400).json({
            message: "Cover Image is required",
            success: false
        })
    }
    let avatar, coverImage;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            return res.status(400).json({
                message: "Something went wrong while uploading avatar on cloudinary!",
                success: false
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error" + error.message,
            success: false
        })
    }
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImage) {
            return res.status(400).json({
                message: "Something went wrong while uploading coverImage on cloudinary!",
                success: false
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error" + error.message,
            success: false
        })
    }
    try {
        const user = await User.create({
            userName,
            fullName,
            email,
            password,
            avatar: {
                publicId: avatar.public_id,
                url: avatar.url
            },
            coverImage: {
                publicId: coverImage.public_id,
                url: coverImage.url
            },
            role: "User"
        });
        if (!user) {
            return res.status(400).json({
                message: "Something Went Wrong While Creating The New User!",
                success: false
            })
        }
        return res.status(201).json({
            message: "User Registerd Successfully!",
            success: true,
            data: user
        })
    } catch (error) {
        if (avatar) {
            await deleteFromCLoudinary(avatar.publicId);
        }
        if (coverImage) {
            await deleteFromCLoudinary(coverImage.publicId);
        }
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error.message,
            success: false
        })
    }
}
//generate access and refreesh token 
const accessAndRefreshToken = async (userId) => {
    try {
        if (!userId) {
            return res.status(400).json({
                message: "userId is required to generate access and refresh token!",
                success: false
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found!",
                success: false
            });
        }
        const access_token = user.generateJwtToken();
        const refresh_token = user.generateRefreshToken();
        user.refresh_token = refresh_token;
        user.save();
        return { access_token, refresh_token }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error.message,
            success: false
        })
    }
}

//login 
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "All feilds are required!",
                success: false
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found!",
                success: false
            });
        }
        const comparePassword = await user.isPasswordMatched(password);
        if (!comparePassword) {
            return res.status(401).json({
                message: "The password provided by you is incorrect!",
                success: false
            })
        }
        const { access_token, refresh_token } = await accessAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
        }
        return res.
            cookie("access_token", access_token, options).
            cookie("refresh_token", refresh_token, options).
            status(200).
            json({
                message: "You LoggedIn Successfully!",
                success: true,
                data: user,
                access_token,
                refresh_token
            })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error.message,
            success: false
        })
    }
}

//get all users
const allUsers = async (req, res) => {
    try {
        const user = req.user?._id;
        if (!user) {
            return res.status(400).json({
                message: "userId is required to fetch all users",
                success: false
            });
        }
        const existingUser = await User.findById(user);
        if (!existingUser || existingUser.length === 0) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }
        if (existingUser.role !== 'Admin') {
            return res.status(400).json({
                message: "You are not authorized to fetch all users list!",
                success: false
            });
        }
        const allUsers = await User.find();
        if (!allUsers) {
            return res.status(400).json({
                message: "Something went wrong while trying to fetch all users list!",
                success: false
            });
        }

        return res.status(200).json({
            message: "All Users Fetched Successfully!",
            success: true,
            data: allUsers
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error,
            success: false
        });
    }
}

//get single user
const getSingleUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({
                message: "UserId is required to find the single user",
                success: false
            });
        }

        const user = await User.findById(userId).populate({ path: "savedPosts", select: "-__v" }).select("-password");
        if (!user) {
            return res.status(400).json({
                message: "Something went wrong while trying to fetch the single user!",
                success: false
            });
        }
        return res.status(200).json({
            message: "User Found Successfully!",
            success: true,
            data: user
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error,
            success: false
        });
    }
}

//updet user details
const updateUser = async (req, res) => {
    try {

        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({
                message: "UserId is required to update the user details!",
                success: false
            });
        }

        const { userName, fullName, email, bio, role } = req.body;
        if (!userName || !fullName || !email || !bio || !role) {
            return res.status(400).json({
                message: "All These Feilds are required to update the user details!",
                success: false
            });
        }

        const existingUser = await User.findById(userId);
        if (existingUser._id.toString() !== userId.toString()) {
           return res.status(400).json({
            message:"You are not authorized to update this user details!",
            success:false
           });
        }

        const user = await User.findOneAndUpdate(userId, {
            userName,
            fullName,
            email,
            bio,
            role
        },
            { new: true });

        if (!user) {
            return res.status(400).json({
                message: "Something went wrong while trying to updating the user details!",
                success: false
            });
        }

        return res.status(200).json({
            message: "User details updated successfully!",
            success: true,
            data: user
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error,
            success: false
        });
    }
}
//update user avatar
const updateAvatar = async (req, res) => {
    const userId = req.params.userId;
    if (!userId) {
        return res.status(400).json({
            message: "UserId is required to update the user details!",
            success: false
        });
    }
    
    const existingUser = await User.findById(userId);
    if(!existingUser || existingUser.length === 0){
        return res.status(400).json({
            message:"User not found!",
            success:false
        })
    }
    const oldAvatar = existingUser?.avatar;
    if(oldAvatar && oldAvatar?.publicId){
        await deleteFromCLoudinary(oldAvatar.publicId);
    }
    
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        return res.status(400).json({
            message:"avatar is missing!",
            success:false
        });
    }

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        if(!avatar){
            return res.status(400).json({
            message:"Something went wrong while uploding avatar on cloudinary",
            success:false
        });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error,
            success: false
        });
    }

    try {
        const user = await User.findByIdAndUpdate(userId,{
            avatar:{
                url:avatar.url,
                publicId:avatar.public_id
            }
        },
        {new:true});

        if(!user){
            return res.status(400).json({
                message:"Something went wrong while update the user avatar!",
                success:false
            });
        }

        return res.status(200).json({
            message:"Avatart updated successfully!",
            success:true,
            data:user
        });

    } catch (error) {
        if(avatar){
            await deleteFromCLoudinary(avatar?.publicId);
        }
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error,
            success: false
        });
    }
}
//update user coverImage
const updateCoverImage = async (req, res) => {
    const userId = req.params.userId;
    if (!userId) {
        return res.status(400).json({
            message: "UserId is required to update the user details!",
            success: false
        });
    }

    const existingUser = await User.findById(userId);
    if(!existingUser || existingUser.length === 0){
        return res.status(400).json({
            message:"User not found!",
            success:false
        })
    }
    const oldCoverImage = existingUser?.coverImage;
    if(oldCoverImage && oldCoverImage?.publicId){
        await deleteFromCLoudinary(oldCoverImage?.publicId);
    }

    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        return res.status(400).json({
            message:"coverImage is required!",
            success:false
        });
    }

    let coverImage;
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if(!coverImage){
            return res.status(400).json({
                message:"Something went wrong while uploading coverImage on Cloudinary!",
                success:false
            })
        }

    try {
       const user = await User.findByIdAndUpdate(userId,{
        coverImage:{
            url:coverImage?.url,
            publicId:coverImage?.public_id
        }
       },
       {new:true});

       if(!user){
        return res.status(400).json({
            message:"Something went wrong while updating the user coverImage!",
            success:false
        });
       }

       return res.status(200).json({
        message:"CoverImage Updated Successfully!",
        success:true,
        data:user
       })
    } catch (error) {
        if(coverImage){
            await deleteFromCLoudinary(coverImage.publicId);
        }
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error,
            success: false
        });
    }
}
//delete user
const deleteUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        if(!userId){
            return res.status(400).json({
                message:"UserId is required!",
                success:false
            });
        }

        const user = await User.findById(userId);
        if(!user || user?.length === 0){
            return res.status(400).json({
                message:"User Not Found!",
                success:false
            });
        }

        const avatar = user?.avatar;
        if(avatar && avatar?.publicId){
            await deleteFromCLoudinary(avatar);
        }

        const coverImage = user?.coverImage;
        if(coverImage && coverImage?.publicId){
            await deleteFromCLoudinary(coverImage?.publicId);
        }

        const deleteUser = await User.findByIdAndDelete(userId);
        if(!deleteUser){
            return res.status(400).json({
                message:"Something went wrong while deleting the User!",
                success:false
            });
        }

        return res.status(200).json({
            message:"User Deleted Successfully!",
            success:true,
            data:deleteUser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error,
            success: false
        });
    }
}
//reset password 
const resetPassword = async (req, res) => {
    try {

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error,
            success: false
        });
    }
}
//refresh token
const refreshToken = async (req, res) => {
    try {

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error:" + error,
            success: false
        });
    }
}
export {
    registerUser,
    accessAndRefreshToken,
    loginUser,
    allUsers,
    getSingleUser,
    updateUser,
    updateAvatar,
    updateCoverImage,
    deleteUser,
    resetPassword,
    refreshToken
}