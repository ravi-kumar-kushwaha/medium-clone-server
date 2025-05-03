import express from "express";
import verifyToken from "../middlewares/auth.js";
import { allComments, createComment, deleteComment, getSingleComment, updateComment } from "../controllers/comment.controller.js";
const router = express.Router();

router.post("/comment-post",verifyToken,createComment);
router.get("/all-comments",allComments);
router.get("/single-comment/:commentId",verifyToken,getSingleComment);
router.put('/update-comment/:commentId',verifyToken,updateComment);
router.delete("/dalete-comment/:commentId",verifyToken,deleteComment);
export default router;