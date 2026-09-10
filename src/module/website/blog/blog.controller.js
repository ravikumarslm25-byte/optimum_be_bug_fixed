// ============================================
// FILE: src/module/website/blog/blog.controller.js
// PURPOSE: API endpoints for blog management
// ============================================

import BlogService from "./blog.service.js";

// ============================================
// IMAGE UPLOAD (featured image + inline editor images)
// multer-s3 streams the file to S3 and exposes req.file.location (the URL)
// ============================================
export const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file || !req.file.location) {
      return res.status(400).json({ status: false, message: "No image uploaded" });
    }
    res.status(200).json({
      status: true,
      url: req.file.location,
      key: req.file.key,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Image upload failed",
    });
  }
};

export const createBlog = async (req, res) => {
  try {
    const data = {
      ...req.body,
      status: req.body.status || "draft",
    };

    const blog = await BlogService.createBlog(data);

    res.status(201).json({
      status: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message || "Failed to create blog",
    });
  }
};

export const getPublishedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await BlogService.getPublishedBlogs(
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      status: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await BlogService.getBlogBySlug(slug);

    if (!blog || blog.status !== "published") {
      return res.status(404).json({
        status: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      status: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch blog",
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};

    const blogs = await BlogService.getAllBlogs(filters);

    res.status(200).json({
      status: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await BlogService.updateBlog(id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Blog updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to update blog",
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await BlogService.deleteBlog(id);

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to delete blog",
    });
  }
};

export const searchBlogs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        status: false,
        message: "Search query required",
      });
    }

    const results = await BlogService.searchBlogs(q);

    res.status(200).json({
      status: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Search failed",
    });
  }
};

export const getBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const blogs = await BlogService.getBlogsByCategory(category);

    res.status(200).json({
      status: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

export const getBlogsByTag = async (req, res) => {
  try {
    const { tag } = req.params;

    const blogs = await BlogService.getBlogsByTag(tag);

    res.status(200).json({
      status: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};
