import Category from "../models/category.model.js";

//create category
const createCategory = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({
                message: "All these feilds are required!",
                success: false
            });
        }
        const user = req.user?._id;
        if (!user) {
            return res.status(400).json({
                message: "user is required to creating the post category!",
                success: false
            });
        }
        const category = await Category.create({
            title,
            description,
            user
        });
        if (!category) {
            return res.status(400).json({
                message: "Something Went wrong while creating the post category",
                success: false
            })
        }
        return res.status(201).json({
            message: "Category Created Successfully!",
            success: true,
            data: category
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false
        });
    }
}
//get all category
const getAllCategory = async (req, res) => {
    try {
        const allCategory = await Category.find().populate("user").select("-password");
        if (!allCategory) {
            return res.status(400).json({
                message: "Something went wrong whle fetching all category!",
                success: false
            });
        }
        return res.status(200).json({
            message: "All Category Fetched Successfully!",
            success: true,
            data: allCategory
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false
        });
    }
}
//get single category by Id
const singleCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        if (!categoryId) {
            return res.status(400).json({
                message: "CategoryId is required to fetching the single category!",
                success: false
            });
        }
        const category = await Category.findById(categoryId).populate("user").select("-password");
        if (!category) {
            return res.status(400).json({
                message: "Something went wrong while fetching the single category!",
                success: false
            });
        }
        return res.status(200).json({
            message: "Category fetched successfully!",
            success: true,
            data: category
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false
        });
    }
}
//update category
const updateCategory = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({
                message: "All these feilds are required to update the category!",
                success: false
            })
        }

        const categoryId = req.params.categoryId;
        if (!categoryId) {
            return res.status(400).json({
                message: "CategoryId is required to update the single category!",
                success: false
            });
        }

        const category = await Category.findById(categoryId).populate("user").select("-password");
        if (!category || category.length === 0) {
            return res.status(400).json({
                message: "category not found!",
                success: false
            });
        }

        const user = req.user?._id;
        if (!user) {
            return res.status(400).json({
                message: "user is required to update the category!",
                success: false
            })
        }

        if (!category?.user?.role === "admin" || !user.toString() === category?.user?._id.toString()) {
            return res.status(400).json({
                message: "you are not authorized to update this category!"
            });
        }

        const updateCategory = await Category.findByIdAndUpdate(categoryId,
            {
                title,
                description
            }, {
            new: true
        });
        if (!updateCategory) {
            return res.status(400).json({
                message: "Something went wrong while trying to update the category!",
                success: false,
            })
        }
        return res.status(200).json({
            message: "Category fetched successfully!",
            success: true,
            data: updateCategory
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false
        });
    }
}
//delete category
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        if (!categoryId) {
            return res.status(400).json({
                message: "CategoryId is required to delete the category!",
                success: false
            });
        }

        const category = await Category.findById(categoryId).populate("user").select("-password");
        if (!category || category.length === 0) {
            return res.status(400).json({
                message: "category not found! or already deleted!",
                success: false
            });
        }

        const user = req.user?._id;
        if (!user) {
            return res.status(400).json({
                message: "user is required to delete the category!",
                success: false
            })
        }

        if (!category?.user?.role === "admin" || !user.toString() === category?.user?._id.toString()) {
            return res.status(400).json({
                message: "you are not authorized to delete this category!"
            });
        }

        const deleteCategory = await Category.findByIdAndDelete(categoryId);
        if (!deleteCategory) {
            return res.status(400).json({
                message: "Something went wrong while trying to delete the category!",
                success: false
            });
        }
        return res.status(200).json({
            message: "Category Deleted successfully!",
            success: true,
            Date: deleteCategory
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false
        });
    }
}

export {
    createCategory,
    getAllCategory,
    singleCategory,
    updateCategory,
    deleteCategory
}