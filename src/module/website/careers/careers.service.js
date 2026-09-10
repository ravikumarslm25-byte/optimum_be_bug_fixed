// ============================================
// FILE: src/module/website/careers/careers.service.js
// PURPOSE: Business logic for careers/jobs
// ============================================

import { JobModel, JobApplicationModel } from "./careers.model.js";

class CareersService {
  // ============================================
  // JOB POSTING OPERATIONS
  // ============================================

  static async createJob(data) {
    try {
      const job = new JobModel(data);
      await job.save();
      console.log("✅ Job created:", job._id);
      return job;
    } catch (error) {
      throw error;
    }
  }

  static async getOpenJobs(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const jobs = await JobModel.find({ status: "open" })
        .sort({ posted_date: -1 })
        .skip(skip)
        .limit(limit);

      const total = await JobModel.countDocuments({ status: "open" });

      return {
        jobs,
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

  static async getJobBySlug(slug) {
    try {
      return await JobModel.findOne({ slug });
    } catch (error) {
      throw error;
    }
  }

  static async getJobById(id) {
    try {
      return await JobModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async getAllJobs(filters = {}) {
    try {
      return await JobModel.find(filters).sort({ posted_date: -1 });
    } catch (error) {
      throw error;
    }
  }

  static async updateJob(id, data) {
    try {
      return await JobModel.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw error;
    }
  }

  static async deleteJob(id) {
    try {
      return await JobModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  static async closeJob(id) {
    try {
      return await JobModel.findByIdAndUpdate(
        id,
        {
          status: "closed",
          closed_date: new Date(),
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // JOB APPLICATION OPERATIONS
  // ============================================

  static async submitApplication(data) {
    try {
      const application = new JobApplicationModel(data);
      await application.save();

      // Increment applications count
      await JobModel.findByIdAndUpdate(data.job_id, {
        $inc: { applications_count: 1 },
      });

      console.log("✅ Job application submitted:", application._id);
      return application;
    } catch (error) {
      throw error;
    }
  }

  static async getApplicationsByJobId(jobId) {
    try {
      return await JobApplicationModel.find({ job_id: jobId }).sort({
        applied_at: -1,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getApplicationById(id) {
    try {
      return await JobApplicationModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async getAllApplications(filters = {}) {
    try {
      return await JobApplicationModel.find(filters)
        .sort({ applied_at: -1 })
        .populate("job_id", "title department location");
    } catch (error) {
      throw error;
    }
  }

  static async updateApplication(id, data) {
    try {
      return await JobApplicationModel.findByIdAndUpdate(id, data, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteApplication(id) {
    try {
      const application = await JobApplicationModel.findById(id);
      if (application) {
        // Decrement applications count
        await JobModel.findByIdAndUpdate(application.job_id, {
          $inc: { applications_count: -1 },
        });
      }
      return await JobApplicationModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  static async getApplicationsByStatus(status) {
    try {
      return await JobApplicationModel.find({ status }).populate(
        "job_id",
        "title department"
      );
    } catch (error) {
      throw error;
    }
  }
}

export default CareersService;
