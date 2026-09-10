// ============================================
// FILE: src/module/website/careers/careers.route.js
// PURPOSE: Routes for jobs and applications
// ============================================

import express from "express";
import * as careersController from "./careers.controller.js";
import { upload } from "../../../config/multer.js";

const router = express.Router();

// ============================================
// JOB POSTING ROUTES (PUBLIC)
// ============================================

// GET /website/careers/jobs (all open jobs with pagination)
router.get("/jobs", careersController.getOpenJobs);

// GET /website/careers/jobs/:slug (single job by slug)
router.get("/jobs/:slug", careersController.getJobBySlug);

// ============================================
// JOB APPLICATION ROUTES (PUBLIC)
// ============================================

// POST /website/careers/apply/:jobId (submit job application with resume)
router.post(
  "/apply/:jobId",
  upload.single("resume"),
  careersController.submitJobApplication
);

// ============================================
// ADMIN ROUTES (Job Management)
// ============================================

// POST /website/careers/admin/jobs (admin - create job)
router.post("/admin/jobs", careersController.createJob);

// GET /website/careers/admin/jobs (admin - all jobs)
router.get("/admin/jobs", careersController.getAllJobs);

// PUT /website/careers/admin/jobs/:id (admin - update job)
router.put("/admin/jobs/:id", careersController.updateJob);

// DELETE /website/careers/admin/jobs/:id (admin - delete job)
router.delete("/admin/jobs/:id", careersController.deleteJob);

// PUT /website/careers/admin/jobs/:id/close (admin - close job)
router.put("/admin/jobs/:id/close", careersController.closeJob);

// ============================================
// ADMIN ROUTES (Application Management)
// ============================================

// GET /website/careers/admin/applications (admin - all applications)
router.get("/admin/applications", careersController.getAllApplications);

// GET /website/careers/admin/jobs/:jobId/applications (admin - applications for job)
router.get("/admin/jobs/:jobId/applications", careersController.getApplicationsByJob);

// PUT /website/careers/admin/applications/:id (admin - update application)
router.put("/admin/applications/:id", careersController.updateApplication);

// DELETE /website/careers/admin/applications/:id (admin - delete application)
router.delete("/admin/applications/:id", careersController.deleteApplication);

export default router;
