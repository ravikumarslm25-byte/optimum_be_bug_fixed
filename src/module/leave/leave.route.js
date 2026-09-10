// ====================================
// FILE: src/module/leave/leave.route.js
// COMPLETE LEAVE ROUTES
// ====================================

import express from "express";
import {
  getAllLeaves,
  listLeaves,
  getLeaveById,
  createLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
  getLeavesByEmployee,
  getLeavesByStatus,
  getLeaveCount,
  applyLeaveProfile,         // ✅ NEW
  getLeaveHistoryProfile,    // ✅ NEW
} from "./leave.controller.js";

const router = express.Router();

// ====================================
// ✅ ALL LEAVE ROUTES
// ====================================

// ✅ PROFILE SECTION - NEW ROUTES (FOR LOGGED-IN USER ONLY)
// Must be BEFORE /:id route!
router.post("/profile/apply/:employee_id", applyLeaveProfile);
router.get("/profile/history/:employee_id", getLeaveHistoryProfile);

// ✅ APPLY/CREATE LEAVE
router.post("/apply", createLeave);

// ✅ GET all leaves (Used by LeaveManagement component)
router.get("/list", listLeaves);

// ✅ GET all leaves (Alternative endpoint)
router.get("/getall", getAllLeaves);

// ✅ GET leave count
router.get("/count", getLeaveCount);

// ✅ GET leaves by status (MUST BE BEFORE /:id)
router.get("/status/:status", getLeavesByStatus);

// ✅ GET leaves by employee (MUST BE BEFORE /:id)
router.get("/employee/:employeeId", getLeavesByEmployee);

// ✅ GET single leave by ID (MUST BE AFTER specific routes)
router.get("/:id", getLeaveById);

// ✅ APPROVE LEAVE
router.put("/:id/approve", approveLeave);

// ✅ REJECT LEAVE
router.put("/:id/reject", rejectLeave);

// ✅ DELETE LEAVE
router.delete("/:id", deleteLeave);

export default router;

// ====================================
// ENDPOINT REFERENCE
// ====================================

/*
POST   /api/leave/apply
└─ Creates new leave
└─ Body: { employee_id, employee_name, leave_type, start_date, end_date, reason, number_of_days }
└─ Response: { status: true, data: {...leave} }

GET    /api/leave/list
└─ Gets all leaves (used by LeaveManagement)
└─ Response: { status: true, data: [{...leave}, ...] }

GET    /api/leave/getall
└─ Alternative endpoint for getting all leaves
└─ Response: { status: true, data: [{...leave}, ...] }

GET    /api/leave/count
└─ Gets leave statistics
└─ Response: { status: true, data: { total, pending, approved, rejected } }

GET    /api/leave/status/PENDING
└─ Gets leaves by status
└─ Response: { status: true, data: [{...leave}, ...] }

GET    /api/leave/employee/:employeeId
└─ Gets leaves for specific employee
└─ Response: { status: true, data: [{...leave}, ...] }

GET    /api/leave/:id
└─ Gets single leave by ID
└─ Response: { status: true, data: {...leave} }

PUT    /api/leave/:id/approve
└─ Approves leave
└─ Body: { approved_by }
└─ Response: { status: true, data: {...leave} }

PUT    /api/leave/:id/reject
└─ Rejects leave
└─ Body: { approved_by, rejection_reason }
└─ Response: { status: true, data: {...leave} }

DELETE /api/leave/:id
└─ Deletes leave
└─ Response: { status: true, data: {...leave} }
*/
