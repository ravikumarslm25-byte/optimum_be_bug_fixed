// ============================================
// FILE: src/module/website/careers/careers.model.js
// PURPOSE: Store job postings and applications
// ============================================

import mongoose from "mongoose";

// ============================================
// JOB POSTING MODEL
// ============================================

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    department: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true, // Rich text
    },
    requirements: [
      {
        type: String,
      },
    ],
    responsibilities: [
      {
        type: String,
      },
    ],
    qualifications: [
      {
        type: String,
      },
    ],
    experience_required: {
      type: Number, // Years
      default: 0,
    },
    location: {
      type: String,
      required: true,
    },
    job_type: {
      type: String,
      enum: ["full_time", "part_time", "contract", "internship"],
      default: "full_time",
    },
    salary_range: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
    },
    experience: {
      type: String, // display string, e.g. "3-5 years"
      default: "",
    },
    salary: {
      type: String, // display string, e.g. "₹6-10 LPA"
      default: "",
    },
    skills: [
      {
        type: String, // shown on the website job card
      },
    ],
    tags: [
      {
        type: String, // internal HR tags for filtering/organising
      },
    ],
    benefits: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",
    },
    deadline: {
      type: Date,
      required: true,
    },
    posted_date: {
      type: Date,
      default: Date.now,
    },
    closed_date: {
      type: Date,
      default: null,
    },
    applications_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate slug
jobSchema.pre("save", function (next) {
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

// ============================================
// JOB APPLICATION MODEL
// ============================================

const jobApplicationSchema = new mongoose.Schema(
  {
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WebsiteJob",
      required: true,
    },
    applicant_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    resume: {
      type: String, // S3 URL
      default: "",
    },
    cover_letter: {
      type: String,
      default: "",
    },
    experience_summary: {
      type: String,
      default: "",
    },
    linkedin_profile: {
      type: String,
      default: "",
    },
    portfolio_link: {
      type: String,
      default: "",
    },
    current_company: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "submitted",
        "reviewing",
        "shortlisted",
        "interview",
        "rejected",
        "accepted",
      ],
      default: "submitted",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    admin_notes: {
      type: String,
      default: "",
    },
    applied_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const JobModel = mongoose.model("WebsiteJob", jobSchema);
const JobApplicationModel = mongoose.model(
  "WebsiteJobApplication",
  jobApplicationSchema
);

export { JobModel, JobApplicationModel };
