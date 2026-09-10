// ====================================
// FILE: src/module/department/department.controller.js
// DEPARTMENT CONTROLLER - FIXED FIELD NAMES
// ====================================

import Department from "./department.model.js";
import Category from "../category/category.model.js";
import Role from "../role master/role.model.js";
import IdcodeServices from "../idcode/idcode.service.js";

// ✅ CREATE DEPARTMENT WITH AUTO-GENERATED ID
// Uses: department_id (auto-generated) + department_name (user input)
export const createDepartment = async (req, res) => {
  try {
    console.log("📥 API Call: POST /department/create");
    console.log("Request Body:", req.body);

    const { department_name } = req.body;

    // ✅ VALIDATION: department_name is required
    if (!department_name || !department_name.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Department name is required",
      });
    }

    const deptNameTrimmed = department_name.toString().trim();

    // ✅ CHECK DUPLICATE
    const existingDept = await Department.findOne({
      department_name: deptNameTrimmed,
    });

    if (existingDept) {
      return res.status(400).json({
        status: false,
        message: "Department name already exists",
      });
    }

    // ✅ GENERATE DEPARTMENT ID (SAME PATTERN AS LEAD)
    // Uses idcodes collection to track ID generation
    const idname = "Department";
    const idcode = "DEPT";

    // Step 1: Initialize idcode in idcodes collection
    await IdcodeServices.addIdCode(idname, idcode);
    console.log("✅ IdCode initialized for Department");

    // Step 2: Generate next ID (DEPT001, DEPT002, etc.)
    const department_id = await IdcodeServices.generateCode(idname);
    console.log("✅ Generated Department ID:", department_id);

    // Step 3: Validate ID generation
    if (!department_id) {
      return res.status(500).json({
        status: false,
        message: "Failed to generate department ID",
      });
    }

    // ✅ CREATE NEW DEPARTMENT WITH GENERATED ID
    const newDepartment = new Department({
      department_id,           // Auto-generated (DEPT001, DEPT002, etc.)
      department_name: deptNameTrimmed,  // User input
      status: "Active",        // Default status
    });

    const savedDepartment = await newDepartment.save();

    console.log("✅ Department created successfully");
    console.log("   ID: ", savedDepartment.department_id);
    console.log("   Name:", savedDepartment.department_name);

    return res.status(201).json({
      status: true,
      message: "Department created successfully",
      data: savedDepartment,
    });
  } catch (error) {
    console.error("❌ Error creating department:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to create department",
    });
  }
};

// ✅ GET ALL DEPARTMENTS
export const getAllDepartments = async (req, res) => {
  try {
    console.log("📥 API Call: GET /department/getall");

    const departments = await Department.find().sort({ department_name: 1 });

    console.log("✅ Departments fetched:", departments.length);

    return res.status(200).json({
      status: true,
      message: "Departments fetched successfully",
      data: departments || [],
    });
  } catch (error) {
    console.error("❌ Error fetching departments:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch departments",
    });
  }
};

// ✅ GET DEPARTMENT BY ID
export const getDepartmentById = async (req, res) => {
  try {
    console.log("📥 API Call: GET /department/:id");
    console.log("Department ID:", req.params.id);

    const { id } = req.params;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        status: false,
        message: "Department not found",
      });
    }

    console.log("✅ Department found:", id);

    return res.status(200).json({
      status: true,
      message: "Department fetched successfully",
      data: department,
    });
  } catch (error) {
    console.error("❌ Error fetching department:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch department",
    });
  }
};

// ✅ UPDATE DEPARTMENT
export const updateDepartment = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /department/:id");
    console.log("Department ID:", req.params.id);
    console.log("Update Data:", req.body);

    const { id } = req.params;
    const { department_name } = req.body;

    // ✅ CHECK IF DEPARTMENT EXISTS
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        status: false,
        message: "Department not found",
      });
    }

    // ✅ CHECK DUPLICATE IF NAME CHANGED
    if (department_name && department_name !== department.department_name) {
      const existingDept = await Department.findOne({
        department_name: department_name.toString().trim(),
        _id: { $ne: id },
      });

      if (existingDept) {
        return res.status(400).json({
          status: false,
          message: "Department name already exists",
        });
      }
    }

    // ✅ UPDATE FIELDS
    if (department_name)
      department.department_name = department_name.toString().trim();

    const updatedDepartment = await department.save();

    console.log("✅ Department updated:", id);

    return res.status(200).json({
      status: true,
      message: "Department updated successfully",
      data: updatedDepartment,
    });
  } catch (error) {
    console.error("❌ Error updating department:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to update department",
    });
  }
};

// ✅ DELETE DEPARTMENT WITH CASCADE DELETE
export const deleteDepartment = async (req, res) => {
  try {
    console.log("📥 API Call: DELETE /department/:id");
    console.log("Department ID:", req.params.id);

    const { id } = req.params;

    // ✅ CHECK IF DEPARTMENT EXISTS
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        status: false,
        message: "Department not found",
      });
    }

    // ✅ CASCADE DELETE: Delete all related categories and roles
    console.log("🗑️ Cascading delete for categories...");
    await Category.deleteMany({ department_id: id });

    console.log("🗑️ Cascading delete for roles...");
    await Role.deleteMany({ department_id: id });

    // ✅ DELETE DEPARTMENT
    const deletedDepartment = await Department.findByIdAndDelete(id);

    console.log("✅ Department deleted with cascade:", id);
    console.log("   Name:", deletedDepartment.department_name);

    return res.status(200).json({
      status: true,
      message: "Department deleted successfully",
      data: deletedDepartment,
    });
  } catch (error) {
    console.error("❌ Error deleting department:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to delete department",
    });
  }
};

// ✅ GET DEPARTMENTS BY STATUS
export const getDepartmentsByStatus = async (req, res) => {
  try {
    console.log("📥 API Call: GET /department/status/:status");
    console.log("Status:", req.params.status);

    const { status } = req.params;

    const departments = await Department.find({ status }).sort({
      department_name: 1,
    });

    console.log("✅ Found", departments.length, "departments with status:", status);

    return res.status(200).json({
      status: true,
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (error) {
    console.error("❌ Error fetching departments:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch departments",
    });
  }
};

// ✅ GET DEPARTMENT COUNT
export const getDepartmentCount = async (req, res) => {
  try {
    console.log("📥 API Call: GET /department/count");

    const totalDepartments = await Department.countDocuments();
    const activeDepartments = await Department.countDocuments({
      status: "Active",
    });
    const inactiveDepartments = await Department.countDocuments({
      status: "Inactive",
    });

    console.log("✅ Department counts fetched");

    return res.status(200).json({
      status: true,
      message: "Department count fetched successfully",
      data: {
        total: totalDepartments,
        active: activeDepartments,
        inactive: inactiveDepartments,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching department count:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch department count",
    });
  }
};

// ✅ SEARCH DEPARTMENTS
export const searchDepartments = async (req, res) => {
  try {
    console.log("📥 API Call: GET /department/search");
    console.log("Query:", req.query.q);

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        status: false,
        message: "Search query is required",
      });
    }

    const departments = await Department.find({
      $or: [
        { department_name: { $regex: q, $options: "i" } },
        { department_id: { $regex: q, $options: "i" } },
      ],
    }).sort({ department_name: 1 });

    console.log("✅ Found", departments.length, "matching departments");

    return res.status(200).json({
      status: true,
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (error) {
    console.error("❌ Error searching departments:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to search departments",
    });
  }
};

// ✅ UPDATE DEPARTMENT STATUS
export const updateDepartmentStatus = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /department/:id/status");
    console.log("Department ID:", req.params.id);
    console.log("New Status:", req.body.status);

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["Active", "Inactive"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status. Valid options: Active, Inactive",
      });
    }

    const department = await Department.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({
        status: false,
        message: "Department not found",
      });
    }

    console.log("✅ Department status updated:", id);

    return res.status(200).json({
      status: true,
      message: "Department status updated successfully",
      data: department,
    });
  } catch (error) {
    console.error("❌ Error updating department status:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to update department status",
    });
  }
};

// ✅ GET DEPARTMENT STATISTICS
export const getDepartmentStatistics = async (req, res) => {
  try {
    console.log("📥 API Call: GET /department/statistics");

    const totalDepartments = await Department.countDocuments();
    const activeDepartments = await Department.countDocuments({
      status: "Active",
    });
    const inactiveDepartments = await Department.countDocuments({
      status: "Inactive",
    });

    const allDepartments = await Department.find().sort({ department_name: 1 });

    console.log("✅ Department statistics fetched");

    return res.status(200).json({
      status: true,
      message: "Department statistics fetched successfully",
      data: {
        counts: {
          total: totalDepartments,
          active: activeDepartments,
          inactive: inactiveDepartments,
        },
        departments: allDepartments,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching statistics:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch statistics",
    });
  }
};

// ✅ EXPORT ALL FUNCTIONS
export default {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByStatus,
  getDepartmentCount,
  searchDepartments,
  updateDepartmentStatus,
  getDepartmentStatistics,
};
