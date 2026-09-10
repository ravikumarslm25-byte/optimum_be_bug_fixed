// ====================================
// FILE: src/module/wfh/wfh.route.js
// COMPLETE WFH ROUTES (NO CHANGES NEEDED)
// ====================================

import express from "express";
import {
  getAllWFH,
  listWFH,
  getWFHById,
  createWFH,
  approveWFH,
  rejectWFH,
  deleteWFH,
  getWFHByEmployee,
  getWFHByStatus,
  getWFHCount,
  applyWFHProfile,        // ✅ NEW
  getWFHHistoryProfile,   // ✅ NEW
} from "./wfh.controller.js";

const router = express.Router();

// ====================================
// ✅ ALL WFH ROUTES
// ====================================

// ✅ PROFILE SECTION - NEW ROUTES (FOR LOGGED-IN USER ONLY)
// Must be BEFORE /apply route!
router.post("/profile/apply/:employee_id", applyWFHProfile);
router.get("/profile/history/:employee_id", getWFHHistoryProfile);

// ✅ APPLY/CREATE WFH REQUEST
router.post("/apply", createWFH);

// ✅ GET all WFH requests (Used by WFHManagement component)
router.get("/list", listWFH);

// ✅ GET all WFH requests (Alternative endpoint)
router.get("/getall", getAllWFH);

// ✅ GET WFH count
router.get("/count", getWFHCount);

// ✅ GET WFH by status (MUST BE BEFORE /:id)
router.get("/status/:status", getWFHByStatus);

// ✅ GET WFH by employee (MUST BE BEFORE /:id)
router.get("/employee/:employeeId", getWFHByEmployee);

// ✅ GET single WFH by ID (MUST BE AFTER specific routes)
router.get("/:id", getWFHById);

// ✅ APPROVE WFH REQUEST
router.put("/:id/approve", approveWFH);

// ✅ REJECT WFH REQUEST
router.put("/:id/reject", rejectWFH);

// ✅ DELETE WFH REQUEST
router.delete("/:id", deleteWFH);

export default router;
