import express from 'express'
import {
    allPost,
    createPost,
    deletePost,
    singlePost,
    trendingPost,
    updatePost,
    updatePostImage
} from '../controllers/post.controller.js';
import verifyToken from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
const router = express.Router();

router.post("/post", verifyToken, upload.single("image"), createPost);
router.get("/get-all-posts", verifyToken, allPost);
router.get("/single-post/:postId", singlePost);
router.put("/update-post/:postId", verifyToken, updatePost);
router.put("/update-post-image/:postId", verifyToken, updatePostImage);
router.delete("/delete-post/:postId", verifyToken, deletePost);
router.get("/get-trending-post", trendingPost);

export default router;