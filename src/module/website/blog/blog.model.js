// ============================================
// FILE: src/module/website/blog/blog.model.js
// PURPOSE: Store blog posts
// ============================================

import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true, // Rich text HTML content
    },
    excerpt: {
      type: String,
      default: "",
      maxlength: 500,
    },
    author: {
      type: String,
      required: true,
    },
    author_id: {
      type: String, // Employee ID
      default: "",
    },
    author_role: {
      type: String, // e.g. "Urological Surgeon" (shown on website)
      default: "",
    },
    author_avatar: {
      type: String, // S3 URL (optional)
      default: "",
    },
    read_time: {
      type: String, // e.g. "8 min read"
      default: "",
    },
    featured_image: {
      type: String, // S3 URL
      default: "",
    },
    featured_image_alt: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    published_date: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments_enabled: {
      type: Boolean,
      default: true,
    },
    seo: {
      meta_title: String,
      meta_description: String,
      meta_keywords: [String],
    },
  },
  { timestamps: true }
);

// Auto-generate slug from title
blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

const BlogModel = mongoose.model("WebsiteBlog", blogSchema);

export default BlogModel;
