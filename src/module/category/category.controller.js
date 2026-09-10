import logger from "../../config/logger.js";
import IdcodeServices from "../idcode/idcode.service.js";
import CategoryModel from "./category.model.js";
import CategoryService from "./category.service.js";

// ➕ Create Category
export const createCategory = async (req, res) => {
  try {
    const { category_name, department_id, department_name, created_by_user } = req.body;

    const idname = "Category";
    const idcode = "CAT";

    await IdcodeServices.addIdCode(idname, idcode);
    const category_id = await IdcodeServices.generateCode(idname);

    if (!category_id) {
      throw new Error("Failed to generate category ID");
    }

    const category = new CategoryModel({
      category_id,
      category_name,
      department_id,
      department_name,
      created_by_user,
    });

    const result = await category.save();

    res.status(200).json({
      status: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    res.status(500).json({
      status: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

// 📄 Get Category by ID
export const getCategoryById = async (req, res) => {
  const { categoryId } = req.query;

  try {
    const category = await CategoryService.getCategoryById(categoryId);

    res.status(200).json({
      status: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    logger.error(`Error fetching category: ${error.message}`);
    res.status(500).json({
      status: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
};

// 📄 Get All Categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryService.getAllCategories();

    res.status(200).json({
      status: true,
      message: "All categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    res.status(500).json({
      status: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// 📄 Get Categories by Department
export const getCategoriesByDepartment = async (req, res) => {
  const { departmentId } = req.query;

  try {
    const categories =
      await CategoryService.getCategoriesByDepartment(departmentId);

    res.status(200).json({
      status: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    logger.error(`Error fetching categories by department: ${error.message}`);
    res.status(500).json({
      status: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// ✏️ Update Category
export const updateCategoryById = async (req, res) => {
  const { categoryId } = req.query;

  try {
    const updated = await CategoryService.updateCategory(
      categoryId,
      req.body
    );

    res.status(200).json({
      status: true,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error) {
    logger.error(`Error updating category: ${error.message}`);
    res.status(500).json({
      status: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

// ❌ Delete Category
export const deleteCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await CategoryService.deleteCategoryByMongoId(id);

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting category: ${error.message}`);
    res.status(500).json({
      status: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};
