// ====================================
// FILE: src/module/employee/employee.route.js
// FIXED: Removed missing imports
// ====================================

import express from "express";
import {
  loginEmployee,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByEmployeeId,
  updateEmployee,
  deleteEmployee,
  getEmployeesByStatus,
  getEmployeesByDepartment,
  //getEmployeesByDepartmentAndAdmin, // ✅ NEW IMPORT
  searchEmployees,
  getEmployeeCount,
  updateEmployeeStatus,
  getEmployeeStatistics,
  editProfileByEmployeeId,
  changePasswordByEmployeeId,
  //updateempdetails, // ✅ NEW IMPORT
} from "./employee.controller.js";

const router = express.Router();

// ✅ LOGIN EMPLOYEE (Must be before other routes)
router.post("/login", loginEmployee);

// ✅ CREATE EMPLOYEE (Both /create and /add work)
router.post("/create", createEmployee);
router.post("/add", createEmployee); // ✅ Alias for /create

// ✅ GET ALL EMPLOYEES
router.get("/getallemployees", getAllEmployees);

// ✅ GET EMPLOYEE COUNT
router.get("/count", getEmployeeCount);

// ✅ GET EMPLOYEE STATISTICS
router.get("/statistics", getEmployeeStatistics);

// ✅ SEARCH EMPLOYEES
router.get("/search", searchEmployees);

// ✅ GET EMPLOYEES BY STATUS
router.get("/status/:status", getEmployeesByStatus);

// ✅ GET EMPLOYEES BY DEPARTMENT
router.get("/department/:department", getEmployeesByDepartment);

// ✅ GET EMPLOYEES BY DEPARTMENT AND ADMIN (NEW - For Reporting Manager Filter)
// Returns employees from selected dept + Admin dept
//router.get("/by-department/:department", getEmployeesByDepartmentAndAdmin);

// ✅ GET EMPLOYEE BY EMPLOYEE_ID STRING (For Profile Page)
// Must be BEFORE /:id route!
router.get("/byemployeeid/:employee_id", getEmployeeByEmployeeId);

// ✅ PROFILE SECTION - Routes for LOGGED-IN USER
// Must be BEFORE /:id route!
router.put("/profile/edit/:employee_id", editProfileByEmployeeId);
router.put("/profile/change-password/:employee_id", changePasswordByEmployeeId);

// ✅ UPDATE EMPLOYEE DETAILS (Used by Edit Employee form)
//router.put("/updateempdetails/:id", updateempdetails);

// ✅ UPDATE EMPLOYEE STATUS
router.put("/:id/status", updateEmployeeStatus);

// ✅ GET EMPLOYEE BY MONGODB _ID
router.get("/:id", getEmployeeById);

// ✅ UPDATE EMPLOYEE (Generic update)
router.put("/:id", updateEmployee);

// ✅ DELETE EMPLOYEE
router.delete("/:id", deleteEmployee);

export default router;
