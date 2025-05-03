import express from 'express'
import verifyToken from '../middlewares/auth.js';
import {
    createCategory,
    deleteCategory,
    getAllCategory,
    singleCategory,
    updateCategory
} from '../controllers/category.controller.js';

const router = express.Router();
router.post("/create-category", verifyToken, createCategory);
router.get("/getall-category", getAllCategory);
router.get("/single-category/:categoryId", verifyToken, singleCategory);
router.put("/update-category/:categoryId", verifyToken, updateCategory);
router.delete("/delete-category/:categoryId", verifyToken, deleteCategory);
export default router;