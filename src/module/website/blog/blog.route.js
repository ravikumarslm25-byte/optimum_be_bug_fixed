// ============================================
// FILE: src/module/website/blog/blog.route.js
// PURPOSE: Routes for blog posts
// ============================================

import express from "express";
import * as blogController from "./blog.controller.js";
import { upload } from "../../../config/multer.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication needed)
// ============================================

// GET /website/blog (get published blogs with pagination)
router.get("/", blogController.getPublishedBlogs);

// GET /website/blog/search?q=keyword
router.get("/search", blogController.searchBlogs);

// GET /website/blog/category/:category
router.get("/category/:category", blogController.getBlogsByCategory);

// GET /website/blog/tag/:tag
router.get("/tag/:tag", blogController.getBlogsByTag);

// GET /website/blog/:slug (get single blog by slug)
router.get("/:slug", blogController.getBlogBySlug);

// ============================================
// ADMIN ROUTES (Authentication required)
// ============================================

// POST /website/blog/admin/create (admin - create blog)
router.post("/admin/create", blogController.createBlog);

// POST /website/blog/admin/upload-image (admin - upload featured/inline image → S3)
router.post(
  "/admin/upload-image",
  upload.single("image"),
  blogController.uploadBlogImage
);

// GET /website/blog/admin/all (admin - get all blogs including drafts)
router.get("/admin/all", blogController.getAllBlogs);

// PUT /website/blog/admin/:id (admin - update blog)
router.put("/admin/:id", blogController.updateBlog);

// DELETE /website/blog/admin/:id (admin - delete blog)
router.delete("/admin/:id", blogController.deleteBlog);

export default router;
