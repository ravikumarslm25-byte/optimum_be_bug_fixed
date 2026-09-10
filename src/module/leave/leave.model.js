// ====================================
// FILE: src/module/leave/leave.model.js
// UPDATED LEAVE MODEL (Matching WFH Pattern)
// ====================================

import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    // ✅ EMPLOYEE REFERENCE (MongoDB ID)
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    // ✅ EMPLOYEE NAME (Required - Stored as backup)
    employee_name: {
      type: String,
      required: [true, "Employee name is required"], // ✅ VALIDATION MESSAGE
      trim: true,
    },

    // ✅ LEAVE TYPE
    leave_type: {
      type: String,
      enum: ["SICK", "CASUAL", "MEDICAL", "MATERNITY", "PATERNITY"],
      required: true,
    },

    // ✅ START DATE
    start_date: {
      type: Date,
      required: true,
      index: true,
    },

    // ✅ END DATE
    end_date: {
      type: Date,
      required: true,
    },

    // ✅ NUMBER OF DAYS
    number_of_days: {
      type: Number,
      required: true,
    },

    // ✅ REASON FOR LEAVE
    reason: {
      type: String,
      trim: true,
      default: "",
    },

    // ✅ STATUS
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    // ✅ APPLIED BY (Who applied - HR or Employee)
    applied_by: {
      type: String, // "HR" or employee name
      default: "Employee",
    },

    // ✅ APPROVED BY
    approved_by: {
      type: String,
      trim: true,
      default: null,
    },

    // ✅ APPROVED DATE
    approved_date: {
      type: Date,
      default: null,
    },

    // ✅ REJECTION REASON
    rejection_reason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// ✅ CREATE INDEXES FOR BETTER PERFORMANCE
leaveSchema.index({ employee_id: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ start_date: 1 });
leaveSchema.index({ end_date: 1 });
leaveSchema.index({ createdAt: -1 });
leaveSchema.index({ employee_id: 1, start_date: 1 });

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;

// ====================================
// KEY CHANGES FROM PREVIOUS VERSION
// ====================================

/*
1. EMPLOYEE NAME:
   - Changed from optional to REQUIRED
   - Added validation message: "Employee name is required"
   - This fixes the error: "Leave validation failed: employee_name: Path `employee_name` is required."

2. EMPLOYEE ID:
   - Changed from String to MongoDB ObjectId with ref: "Employee"
   - Allows proper population with employee details
   - More efficient querying

3. DATE RANGE:
   - Now has both start_date and end_date
   - Matches the WFH model pattern
   - Supports multi-day leaves

4. APPLIED BY:
   - Added field to track who applied the leave
   - "HR" if HR applied for someone else
   - "Employee" if employee applied for themselves (default)

5. INDEXES:
   - Added indexes for better query performance
   - Index on employee_id for fast lookups
   - Index on status for filtering
   - Composite index on employee_id + start_date
*/

// ====================================
// SAMPLE LEAVE DOCUMENTS
// ====================================

/*
{
  "_id": ObjectId("650a1b2c3d4e5f6g7h8i9j0k"),
  "employee_id": ObjectId("650a1b2c3d4e5f6g7h8i9j0a"),
  "employee_name": "John Doe",                          // ✅ Now required!
  "leave_type": "SICK",
  "start_date": ISODate("2026-03-20T00:00:00.000Z"),
  "end_date": ISODate("2026-03-22T00:00:00.000Z"),
  "number_of_days": 3,
  "reason": "Feeling unwell",
  "status": "PENDING",
  "applied_by": "HR",                                   // ✅ New field!
  "approved_by": null,
  "approved_date": null,
  "rejection_reason": "",
  "createdAt": ISODate("2026-03-15T10:30:00.000Z"),
  "updatedAt": ISODate("2026-03-15T10:30:00.000Z"),
  "__v": 0
}
*/
