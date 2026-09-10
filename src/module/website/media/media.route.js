// ============================================
// FILE: src/module/website/media/media.route.js
// PURPOSE: Routes for media coverage
// ============================================

import express from "express";
import * as mediaController from "./media.controller.js";
import { upload } from "../../../config/multer.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", mediaController.getPublishedMedia);
router.get("/featured", mediaController.getFeaturedMedia);

// ADMIN ROUTES
router.post("/admin/add", mediaController.addMediaItem);
router.post(
  "/admin/upload-image",
  upload.single("image"),
  mediaController.uploadMediaImage
);
router.get("/admin/all", mediaController.getAllMedia);
router.put("/admin/:id", mediaController.updateMedia);
router.delete("/admin/:id", mediaController.deleteMedia);

export default router;
