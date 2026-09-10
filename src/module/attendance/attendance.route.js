import express from "express";
import {
  checkIn,
  checkOut,
  manualAttendance,
  getMonthlyAttendance,
  getEmployeeAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceLockStatus,
} from "./attendance.controller.js";

const router = express.Router();

// Check in
router.post("/checkin", checkIn);

// Check out
router.post("/checkout", checkOut);

// Manual attendance
router.post("/manual", manualAttendance);

// Get monthly attendance
router.get("/month/:month", getMonthlyAttendance);

// Get employee attendance
router.get("/employee/:employee_id", getEmployeeAttendance);

// 🔒 Payroll lock status for a month (UI disables editing when locked)
router.get("/lock-status/:year/:month", getAttendanceLockStatus);

// Update attendance
router.put("/:attendance_id", updateAttendance);

// Delete attendance
router.delete("/:attendance_id", deleteAttendance);

export default router;
