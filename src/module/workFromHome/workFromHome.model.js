// File: src/module/workFromHome/workFromHome.model.js
import mongoose from "mongoose";

const workFromHomeSchema = new mongoose.Schema(
  {
    wfh_id: {
      type: String,
      unique: true,
      required: true,
      description: "Format: WFH-YYYYMM-0001",
    },

    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    employee_name: String,

    date: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    start_time: String,

    end_time: String,

    work_description: String,

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    approved_by_name: String,

    approval_date: Date,

    approval_comments: String,

    document: String,

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WorkFromHome", workFromHomeSchema);
