// ============================================
// FILE: src/module/website/blog/blog.service.js
// PURPOSE: Business logic for blog posts
// ============================================

import BlogModel from "./blog.model.js";

class BlogService {
  // Create blog
  static async createBlog(data) {
    try {
      if (data.status === "published" && !data.published_date) {
        data.published_date = new Date();
      }
      const blog = new BlogModel(data);
      await blog.save();
      console.log("✅ Blog created:", blog._id);
      return blog;
    } catch (error) {
      throw error;
    }
  }

  // Get all published blogs
  static async getPublishedBlogs(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const blogs = await BlogModel.find({ status: "published" })
        .sort({ published_date: -1 })
        .skip(skip)
        .limit(limit);

      const total = await BlogModel.countDocuments({ status: "published" });

      return {
        blogs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get blog by slug
  static async getBlogBySlug(slug) {
    try {
      const blog = await BlogModel.findOne({ slug });
      if (blog && blog.status === "published") {
        // Increment views
        await BlogModel.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
      }
      return blog;
    } catch (error) {
      throw error;
    }
  }

  // Get blog by ID
  static async getBlogById(id) {
    try {
      return await BlogModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Get all blogs (admin)
  static async getAllBlogs(filters = {}) {
    try {
      return await BlogModel.find(filters).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Update blog
  static async updateBlog(id, data) {
    try {
      // If status is changed to published, set published_date
      if (data.status === "published" && data.published_date === undefined) {
        data.published_date = new Date();
      }

      return await BlogModel.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw error;
    }
  }

  // Delete blog
  static async deleteBlog(id) {
    try {
      return await BlogModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Search blogs
  static async searchBlogs(keyword) {
    try {
      return await BlogModel.find(
        {
          $or: [
            { title: { $regex: keyword, $options: "i" } },
            { content: { $regex: keyword, $options: "i" } },
            { tags: { $regex: keyword, $options: "i" } },
          ],
          status: "published",
        }
      ).sort({ published_date: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get blogs by category
  static async getBlogsByCategory(category) {
    try {
      return await BlogModel.find({
        category,
        status: "published",
      }).sort({ published_date: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get blogs by tag
  static async getBlogsByTag(tag) {
    try {
      return await BlogModel.find({
        tags: tag,
        status: "published",
      }).sort({ published_date: -1 });
    } catch (error) {
      throw error;
    }
  }
}

export default BlogService;
