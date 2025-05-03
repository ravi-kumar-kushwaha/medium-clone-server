import express from "express"
import {
    allUsers,
    deleteUser,
    getSingleUser,
    loginUser,
    refreshToken,
    registerUser,
    resetPassword,
    updateAvatar,
    updateCoverImage,
    updateUser
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.js";
import verifyToken from "../middlewares/auth.js";
const router = express.Router();

router.post("/signup", upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }]), registerUser);

router.post("/signin", loginUser);
router.get("/get-all-users", verifyToken, allUsers);
router.get("/get-single-user/:userId", verifyToken, getSingleUser);
router.put("/update-user/:userId", verifyToken, updateUser);
router.put("/update-avatar/:userId", verifyToken, updateAvatar);
router.put("/update-coverImage/:userId", verifyToken, updateCoverImage);
router.delete("/delete-user/:userId", verifyToken, deleteUser);
router.put("/reset-password/:userId", verifyToken, resetPassword);
router.get("/refresh-token/:userId", verifyToken, refreshToken);

export default router;