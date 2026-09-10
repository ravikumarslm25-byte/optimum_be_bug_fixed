// ============================================
// FILE: src/module/website/careers/careers.controller.js
// PURPOSE: API endpoints for careers/jobs
// ============================================

import CareersService from "./careers.service.js";

// ============================================
// JOB POSTING ENDPOINTS
// ============================================

export const createJob = async (req, res) => {
  try {
    const job = await CareersService.createJob(req.body);
    res.status(201).json({
      status: true,
      message: "Job posted successfully",
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message || "Failed to create job",
    });
  }
};

export const getOpenJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await CareersService.getOpenJobs(
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
      message: error.message || "Failed to fetch jobs",
    });
  }
};

export const getJobBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const job = await CareersService.getJobBySlug(slug);

    if (!job) {
      return res.status(404).json({
        status: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      status: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch job",
    });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};
    const jobs = await CareersService.getAllJobs(filters);

    res.status(200).json({
      status: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch jobs",
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CareersService.updateJob(id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Job updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to update job",
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CareersService.deleteJob(id);

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to delete job",
    });
  }
};

export const closeJob = async (req, res) => {
  try {
    const { id } = req.params;
    const closed = await CareersService.closeJob(id);

    if (!closed) {
      return res.status(404).json({
        status: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Job closed successfully",
      data: closed,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to close job",
    });
  }
};

// ============================================
// JOB APPLICATION ENDPOINTS
// ============================================

export const submitJobApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    const data = {
      ...req.body,
      job_id: jobId,
      status: "submitted",
    };

    // resume file streamed to S3 by multer-s3 → req.file.location
    if (req.file && req.file.location) {
      data.resume = req.file.location;
    }

    const application = await CareersService.submitApplication(data);

    res.status(201).json({
      status: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message || "Failed to submit application",
    });
  }
};

export const getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await CareersService.getApplicationsByJobId(jobId);

    res.status(200).json({
      status: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch applications",
    });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};
    const applications = await CareersService.getAllApplications(filters);

    res.status(200).json({
      status: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch applications",
    });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CareersService.updateApplication(id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Application updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to update application",
    });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CareersService.deleteApplication(id);

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to delete application",
    });
  }
};
