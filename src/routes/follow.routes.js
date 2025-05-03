import express from 'express';
import verifyToken from '../middlewares/auth.js';
import {
    follow,
    followers,
    following,
    unFollow
} from '../controllers/follow.controller.js';
const router = express.Router();

router.post("/follow", verifyToken, follow);
router.post("/unfollow", verifyToken, unFollow);
router.get("/followers/:userId", verifyToken, followers);
router.get("/following/:userId", verifyToken, following);

export default router;