import express from "express";
import {
  createCategory,
  getCategoryById,
  getAllCategories,
  getCategoriesByDepartment,
  updateCategoryById,
  deleteCategoryById,
} from "./category.controller.js";

const categoryRoute = express.Router();

categoryRoute.post("/addcategory", createCategory);
categoryRoute.get("/getcategory", getCategoryById);
categoryRoute.get("/getallcategories", getAllCategories);
categoryRoute.get("/getcategoriesbydepartment", getCategoriesByDepartment);
categoryRoute.put("/updatecategory", updateCategoryById);
categoryRoute.delete("/deletecategory/:id", deleteCategoryById);

export default categoryRoute;



