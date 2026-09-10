// ====================================
// FILE: src/module/payroll/payroll.route.js
// COMPLETE PAYROLL ROUTES
// ====================================

import express from "express";
import {
  previewPayroll,
  generatePayroll,
  getAllPayroll,
  getPayrollById,
  getPayrollByMonth,
  getPayrollByEmployee,
  updatePayroll,
  approvePayroll,
  markPayrollAsPaid,
  deletePayroll,
  getPayrollStatistics,
} from "./payroll.controller.js";

const router = express.Router();

// ====================================
// ✅ ALL PAYROLL ROUTES
// ====================================

// ✅ PREVIEW payroll (compute without saving — feeds the Generate review table)
router.post("/preview", previewPayroll);

// ✅ GENERATE PAYROLL FOR ALL EMPLOYEES
router.post("/generate", generatePayroll);

// ✅ GET all payroll records
router.get("/list", getAllPayroll);

// ✅ GET payroll statistics
router.get("/statistics", getPayrollStatistics);

// ✅ GET payroll by month and year (MUST BE BEFORE /:id)
router.get("/month/:month/:year", getPayrollByMonth);

// ✅ GET payroll by employee (MUST BE BEFORE /:id)
router.get("/employee/:employeeId", getPayrollByEmployee);

// ✅ GET single payroll by ID (MUST BE AFTER specific routes)
router.get("/:id", getPayrollById);

// ✅ UPDATE payroll details
router.put("/:id", updatePayroll);

// ✅ APPROVE payroll
router.put("/:id/approve", approvePayroll);

// ✅ MARK payroll as PAID
router.put("/:id/paid", markPayrollAsPaid);

// ✅ DELETE payroll
router.delete("/:id", deletePayroll);

export default router;

// ====================================
// ENDPOINT REFERENCE
// ====================================

/*
POST   /api/payroll/generate
└─ Generate payroll for all active employees
└─ Body: { month: 1-12, year: 2024 }
└─ Response: { status: true, data: { total_employees, total_gross, total_net } }

GET    /api/payroll/list
└─ Get all payroll records
└─ Response: { status: true, data: [...payroll] }

GET    /api/payroll/statistics
└─ Get payroll statistics
└─ Response: { status: true, data: { counts, totals } }

GET    /api/payroll/month/:month/:year
└─ Get payroll for specific month/year
└─ Response: { status: true, data: [...payroll] }

GET    /api/payroll/employee/:employeeId
└─ Get all payroll records for specific employee
└─ Response: { status: true, data: [...payroll] }

GET    /api/payroll/:id
└─ Get single payroll record by ID
└─ Response: { status: true, data: {...payroll} }

PUT    /api/payroll/:id
└─ Update payroll details
└─ Body: { field: value }
└─ Response: { status: true, data: {...updated} }

PUT    /api/payroll/:id/approve
└─ Approve payroll
└─ Body: { approved_by: "HR" }
└─ Response: { status: true, data: {...payroll} }

PUT    /api/payroll/:id/paid
└─ Mark payroll as paid
└─ Body: { payment_date: "2024-01-31", payment_method: "BANK_TRANSFER" }
└─ Response: { status: true, data: {...payroll} }

DELETE /api/payroll/:id
└─ Delete payroll record
└─ Response: { status: true, data: {...deleted} }
*/
