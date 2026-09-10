// ============================================
// FILE: src/module/website/media/media.service.js
// PURPOSE: Business logic for media coverage
// ============================================

import MediaModel from "./media.model.js";

class MediaService {
  static async addMediaItem(data) {
    try {
      const media = new MediaModel(data);
      await media.save();
      console.log("✅ Media coverage added:", media._id);
      return media;
    } catch (error) {
      throw error;
    }
  }

  static async getPublishedMedia(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const media = await MediaModel.find({ status: "published" })
        .sort({ coverage_date: -1 })
        .skip(skip)
        .limit(limit);

      const total = await MediaModel.countDocuments({ status: "published" });

      return {
        media,
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

  static async getFeaturedMedia(limit = 5) {
    try {
      return await MediaModel.find({ featured: true, status: "published" })
        .sort({ coverage_date: -1 })
        .limit(limit);
    } catch (error) {
      throw error;
    }
  }

  static async getAllMedia(filters = {}) {
    try {
      return await MediaModel.find(filters).sort({ coverage_date: -1 });
    } catch (error) {
      throw error;
    }
  }

  static async getMediaById(id) {
    try {
      return await MediaModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async updateMedia(id, data) {
    try {
      return await MediaModel.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw error;
    }
  }

  static async deleteMedia(id) {
    try {
      return await MediaModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }
}

export default MediaService;
