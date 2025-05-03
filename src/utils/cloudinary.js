import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
cloudinary.config( {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
    if(!filePath){
        return null;
    }
    try {
        const response = await cloudinary.uploader.upload(filePath, {resource_type: "auto"});
        console.log("Image uploaded successfully on cloudinary", response.url);
        fs.unlinkSync(filePath);
        return response;
    } catch (error) {
        console.log("Error while uploading on cloudinary", error);
        fs.unlinkSync(filePath);    
        return null;
    }
}

const deleteFromCLoudinary = async (publicId,resourceType="image") => {
    try {
        if(!publicId){
            return null;
        }
        const response = await cloudinary.uploader.destroy(publicId,{
            resource_type:resourceType
        });
        console.log("Image deleted successfully from cloudinary",response,publicId);
        return response;
    } catch (error) {
        console.log("Error while deleting from cloudinary",error);
        return null;
    }
}

export {
    uploadOnCloudinary,
    deleteFromCLoudinary
};