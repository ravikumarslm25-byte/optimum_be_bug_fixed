// ====================================
// FILE: src/module/employee/employee.model.js
// FIXED: Made officialEmail optional for backward compatibility with existing data
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

    // ✅ CONTACT DETAILS - OLD (Keep for backward compatibility with existing data)
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },

    // ✅ CONTACT DETAILS - OFFICIAL (NEW - Optional for backward compatibility)
    // ⚠️ IMPORTANT: Made optional (no required: true) so existing employees work
    officialEmail: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      validate: {
        validator: function(v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format"
      }
    },
    officialPhone: {
      type: String,
      trim: true,
    },

    // ✅ CONTACT DETAILS - PERSONAL (NEW - Optional)
    personalEmail: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      validate: {
        validator: function(v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format"
      }
    },
    personalPhone: {
      type: String,
      trim: true,
    },

    // ✅ ADDRESS
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

    // ✅ BANK DETAILS - OLD (Keep for backward compatibility, optional)
    bankAccountNo: {
      type: String,
      trim: true,
      default: null,
    },

    // ✅ BANK DETAILS - NEW (Expanded, all optional)
    bankAccountName: {
      type: String,
      trim: true,
      default: null,
    },
    bankAccountNumber: {
      type: String,
      trim: true,
      default: null,
    },
    bankAccountType: {
      type: String,
      enum: ["Savings", "Current", "Others", null],
      default: null,
    },
    bankIFSCCode: {
      type: String,
      trim: true,
      default: null,
    },
    bankName: {
      type: String,
      trim: true,
      default: null,
    },

    // ✅ SALARY INFORMATION
    ctc: {
      type: Number,
      default: 0,
    },
    leaveBalance: {
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

    // ✅ OFFICE LOCATION
    officeLocation: {
      lat: {
        type: String,
        default: "9.925698",
      },
      lng: {
        type: String,
        default: "78.094528",
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

// ✅ CREATE INDEXES
employeeSchema.index({ aadhaarNumber: 1 }, { sparse: true });
employeeSchema.index({ employee_id: 1 }, { unique: true, sparse: true });
employeeSchema.index({ email: 1 }, { sparse: true });
employeeSchema.index({ officialEmail: 1 }, { sparse: true });
employeeSchema.index({ category_name: 1 }, { sparse: true });
employeeSchema.index({ department: 1 });
employeeSchema.index({ officialPhone: 1 }, { sparse: true });
employeeSchema.index({ personalEmail: 1 }, { sparse: true });
employeeSchema.index({ personalPhone: 1 }, { sparse: true });

// Create and export the Employee model
const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
