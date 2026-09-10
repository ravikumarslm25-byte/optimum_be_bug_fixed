// ====================================
// FILE: src/module/employee/employee.model.js
// FIXED: Made jobTitle optional (not required)
// ====================================

import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    // ✅ EMPLOYEE ID (User enters manually)
    employee_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      sparse: true,
    },

    // ✅ BASIC INFORMATION
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
      type: Date,
    },
    qualification: {
      type: String,
      trim: true,
    },

    // ✅ JOB INFORMATION
    jobTitle: {
      type: String,
      trim: true,
      // FIXED: Removed required: true
      // Now jobTitle is optional
    },
    dateOfJoining: {
      type: Date,
    },
    department: {
      type: String,
      trim: true,
    },
    reportingManager: {
      type: String,
      trim: true,
    },

    // ✅ CONTACT DETAILS
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    // ✅ Additional contact fields collected by the Add/Edit Employee form
    officialEmail: { type: String, trim: true, lowercase: true },
    officialPhone: { type: String, trim: true },
    personalEmail: { type: String, trim: true, lowercase: true },
    personalPhone: { type: String, trim: true },
    address: {
      type: String,
      trim: true,
    },

    // ✅ DOCUMENTS
    aadhaarNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    healthInsurance: {
      type: String,
      trim: true,
    },
    bankAccountNo: {
      type: String,
      trim: true,
    },
    // ✅ Full bank details collected by the Add/Edit Employee form
    bankName: { type: String, trim: true },
    bankAccountName: { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    bankAccountType: { type: String, trim: true },
    bankIFSCCode: { type: String, trim: true },

    // ✅ SALARY INFORMATION
    ctc: {
      type: Number,
      default: 0,
    },
    leaveBalance: {
      type: Number,
      default: 0,
    },

    // ✅ PAID-LEAVE CARRY-FORWARD BALANCE (Policy: 1 CL + 1 SL / month, unused carries forward)
    // Updated automatically each time a month's payroll is generated.
    paid_leave_balance: {
      type: Number,
      default: 0,
    },
    lastIncrementDate: {
      type: Date,
    },
    lastIncrementCTC: {
      type: Number,
      default: 0,
    },

    // ✅ STATUS
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
    },

    // ✅ AUTHENTICATION
    password: {
      type: String,
      trim: true,
    },

    // ✅ ROLE
    role_id: {
      type: String,
      trim: true,
    },

    // ✅ ROLE NAME (User Management)
    role_name: {
      type: String,
      trim: true,
      index: true,
      default: null,
    },

    // ✅ CATEGORY NAME (User Access)
    category_name: {
      type: String,
      trim: true,
      index: true,
      default: null,
    },

    // ✅ WORK FROM HOME
    wfhApproved: {
      type: Boolean,
      default: false,
    },

    // ✅ WORK FROM ANYWHERE/ANYTHING (WFT)
    wft: {
      type: Boolean,
      default: false,
    },

    // ✅ OFFICE LOCATION (Employee's assigned office location for login verification)
    officeLocation: {
      lat: {
        type: Number,
        required: true,
        default: 9.925416,
      },
      lng: {
        type: Number,
        required: true,
        default: 78.094837,
      },
      address: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // ✅ DAILY ATTENDANCE TRACKING
    daily_attendance: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        present: {
          type: Boolean,
          default: false,
        },
        remarks: {
          type: String,
          trim: true,
        },
      },
    ],

    // ✅ LAST LOGIN TRACKING
    lastlogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for sparse fields and category
employeeSchema.index({ aadhaarNumber: 1 }, { sparse: true });
employeeSchema.index({ employee_id: 1 }, { unique: true, sparse: true });
employeeSchema.index({ email: 1 }, { unique: true, sparse: true });
employeeSchema.index({ category_name: 1 }, { sparse: true });

// Create and export the Employee model
const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
