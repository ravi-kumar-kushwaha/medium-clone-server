import express from 'express'
import verifyToken from '../middlewares/auth.js';
import {
    getAllSavedPost,
    removePost,
    savePost
} from '../controllers/savedPost.controller.js';
const router = express.Router();

router.post("/save-post", verifyToken, savePost);
router.post("/remove-post", verifyToken, removePost);
router.get("/all-saved-post", verifyToken, getAllSavedPost);

export default router