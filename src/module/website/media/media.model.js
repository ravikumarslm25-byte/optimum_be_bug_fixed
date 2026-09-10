// ============================================
// FILE: src/module/website/media/media.model.js
// PURPOSE: Store media coverage items
// ============================================

import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true, // article content / excerpt
    },
    media_outlet: {
      type: String,
      required: true, // name of publication / channel
    },
    article_link: {
      type: String,
      default: "", // external URL to the article
    },
    coverage_image: {
      type: String,
      default: "", // S3 URL
    },
    featured: {
      type: Boolean,
      default: false, // shown in the website "Featured Coverage" section
    },
    coverage_date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      default: "news", // press | news | interviews | awards
      trim: true,
    },
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "published",
    },
  },
  { timestamps: true }
);

const MediaModel = mongoose.model("WebsiteMediaCoverage", mediaSchema);

export default MediaModel;
