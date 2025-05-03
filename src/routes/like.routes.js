import express from 'express'
import verifyToken from '../middlewares/auth.js';
import { dislikeComment, likeComment, likePost, unlikePost } from '../controllers/like.controller.js';

const router = express.Router();

router.post("/post-like",verifyToken,likePost);
router.put("/unlike-post",verifyToken,unlikePost);

router.post("/like-comment",verifyToken,likeComment);
router.put("/dislike-comment",verifyToken,dislikeComment);
export default router;