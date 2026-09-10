// ============================================
// FILE: src/module/website/media/media.controller.js
// PURPOSE: API endpoints for media coverage
// ============================================

import MediaService from "./media.service.js";

// ============================================
// IMAGE UPLOAD (coverage image → S3 via multer-s3)
// ============================================
export const uploadMediaImage = async (req, res) => {
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

export const addMediaItem = async (req, res) => {
  try {
    const data = {
      ...req.body,
      status: req.body.status || "published",
    };

    const media = await MediaService.addMediaItem(data);

    res.status(201).json({
      status: true,
      message: "Media coverage added successfully",
      data: media,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message || "Failed to add media coverage",
    });
  }
};

export const getPublishedMedia = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await MediaService.getPublishedMedia(
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
      message: error.message || "Failed to fetch media coverage",
    });
  }
};

export const getFeaturedMedia = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const featured = await MediaService.getFeaturedMedia(parseInt(limit));

    res.status(200).json({
      status: true,
      count: featured.length,
      data: featured,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch featured media",
    });
  }
};

export const getAllMedia = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};

    const media = await MediaService.getAllMedia(filters);

    res.status(200).json({
      status: true,
      count: media.length,
      data: media,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch media",
    });
  }
};

export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await MediaService.updateMedia(id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Media coverage not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Media coverage updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to update media coverage",
    });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await MediaService.deleteMedia(id);

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Media coverage not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Media coverage deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to delete media coverage",
    });
  }
};
