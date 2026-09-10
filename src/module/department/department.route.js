// ====================================
// FILE: src/module/department/department.route.js
// COMPLETE DEPARTMENT ROUTES
// ====================================

import express from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByStatus,
  getDepartmentCount,
  searchDepartments,
  updateDepartmentStatus,
  getDepartmentStatistics,
} from "./department.controller.js";

const router = express.Router();

// ====================================
// ✅ ALL DEPARTMENT ROUTES
// ====================================

// ✅ GET all departments (used in dropdowns - MUST BE FIRST!)
router.get("/getall", getAllDepartments);

// ✅ GET department statistics
router.get("/statistics", getDepartmentStatistics);

// ✅ GET department count
router.get("/count", getDepartmentCount);

// ✅ SEARCH departments
router.get("/search", searchDepartments);

// ✅ CREATE new department
router.post("/create", createDepartment);

// ✅ GET departments by status
router.get("/status/:status", getDepartmentsByStatus);

// ✅ GET department by ID (MUST BE AFTER specific routes like /getall, /search, /count)
router.get("/:id", getDepartmentById);

// ✅ UPDATE department status
router.put("/:id/status", updateDepartmentStatus);

// ✅ UPDATE department
router.put("/:id", updateDepartment);

// ✅ DELETE department
router.delete("/:id", deleteDepartment);

export default router;

// ====================================
// ROUTE ORDER EXPLANATION
// ====================================

// ⚠️ IMPORTANT: Route matching order matters!
// 
// Express matches routes in the order they are defined.
// If /:id comes before /getall, then /getall will be
// treated as an ID and won't match the getAllDepartments function.
//
// CORRECT ORDER:
// 1. Specific routes first: /getall, /statistics, /count, /search
// 2. POST routes: /create
// 3. Status routes: /status/:status
// 4. Generic routes: /:id (with GET, PUT, DELETE)
//
// This ensures /getall matches getAllDepartments, not getDepartmentById

// ====================================
// COMPLETE ENDPOINT REFERENCE
// ====================================

/*
GET    /department/getall
└─ Returns: All departments sorted by name
└─ Used by: CreateEmployeeModal, EditEmployeeModal dropdowns
└─ Response: { status: true, data: [...departments] }

GET    /department/statistics
└─ Returns: Department statistics and full list
└─ Used by: Dashboard, Statistics page
└─ Response: { status: true, data: { counts: {...}, departments: [...] } }

GET    /department/count
└─ Returns: Count of total, active, inactive departments
└─ Used by: Dashboard widgets
└─ Response: { status: true, data: { total: 8, active: 8, inactive: 0 } }

GET    /department/search?q=IT
└─ Returns: Departments matching search query
└─ Used by: Search functionality
└─ Response: { status: true, data: [...matching departments] }

POST   /department/create
└─ Creates: New department
└─ Used by: Department Master in Settings
└─ Body: { departmentName: "IT", description: "..." }
└─ Response: { status: true, data: {...new department} }

GET    /department/status/Active
└─ Returns: All departments with status = Active
└─ Used by: Filter by status
└─ Response: { status: true, data: [...active departments] }

GET    /department/:id
└─ Returns: Single department by ID
└─ Used by: View department details
└─ Response: { status: true, data: {...department} }

PUT    /department/:id/status
└─ Updates: Department status (Active/Inactive)
└─ Used by: Toggle status in Settings
└─ Body: { status: "Active" }
└─ Response: { status: true, data: {...updated department} }

PUT    /department/:id
└─ Updates: Department details (name, description)
└─ Used by: Edit department in Settings
└─ Body: { departmentName: "...", description: "..." }
└─ Response: { status: true, data: {...updated department} }

DELETE /department/:id
└─ Deletes: Department by ID
└─ Used by: Delete in Settings
└─ Response: { status: true, data: {...deleted department} }
*/
