import logger from "../../config/logger.js";
import IdcodeServices from "../idcode/idcode.service.js";
import RoleService from "./rolem.service.js";  // ✅ rolem.service.js
import Role from "./role.model.js";              // ✅ role.model.js

/**
 * ✅ CREATE ROLE WITH DEPARTMENT & CATEGORY NAMES
 * 
 * CRITICAL: This function now stores:
 * - role_id (auto-generated)
 * - role_name (user input)
 * - department_id (selected)
 * - department_name (from selected department)  ← IMPORTANT!
 * - category_id (selected)
 * - category_name (from selected category)     ← IMPORTANT!
 */
export const createRole = async (req, res) => {
  try {
    console.log("📥 API Call: POST /rolemaster/create");
    console.log("Request Body:", req.body);

    const {
      role_name,
      department_id,
      department_name,  // ✅ Now expecting from frontend
      category_id,
      category_name,    // ✅ Now expecting from frontend
      accessLevels,
      created_by_user,
      status,
    } = req.body;

    // ✅ VALIDATION: All required fields
    if (!role_name || !role_name.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Role name is required",
      });
    }

    if (!department_id || !department_id.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Department ID is required",
      });
    }

    if (!department_name || !department_name.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Department name is required",
      });
    }

    if (!category_id || !category_id.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Category ID is required",
      });
    }

    if (!category_name || !category_name.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Category name is required",
      });
    }

    const roleNameTrimmed = role_name.toString().trim();
    const departmentNameTrimmed = department_name.toString().trim();
    const categoryNameTrimmed = category_name.toString().trim();

    // ✅ GENERATE ROLE ID (RAC001, RAC002, etc.)
    const idname = "RoleAccess";
    const idcode = "RAC";

    // Step 1: Initialize idcode if it doesn't exist
    await IdcodeServices.addIdCode(idname, idcode);
    console.log("✅ IdCode initialized for Role");

    // Step 2: Generate next ID
    const role_id = await IdcodeServices.generateCode(idname);
    console.log("✅ Generated Role ID:", role_id);

    // Step 3: Validate ID generation
    if (!role_id) {
      return res.status(500).json({
        status: false,
        message: "Failed to generate role ID",
      });
    }

    // ✅ BUILD ROLE DATA WITH DEPARTMENT & CATEGORY NAMES
    const roleData = {
      role_id,                           // ✅ Auto-generated
      role_name: roleNameTrimmed,        // ✅ User input
      department_id,                      // ✅ Selected
      department_name: departmentNameTrimmed,  // ✅ From selected department
      category_id,                        // ✅ Selected
      category_name: categoryNameTrimmed,      // ✅ From selected category
      accessLevels: accessLevels || [],  // Optional
      status: status || "Active",        // ✅ FIXED: "Active" not "ACTIVE" (enum validation)
      created_by_user,                   // Optional
    };

    console.log("📤 Saving role data:", roleData);

    // ✅ CREATE ROLE IN DATABASE
    const result = await Role.create(roleData);

    console.log("✅ Role created successfully");
    console.log("   ID: ", result.role_id);
    console.log("   Name:", result.role_name);
    console.log("   Department:", result.department_name);
    console.log("   Category:", result.category_name);

    return res.status(200).json({
      status: true,
      message: "Role created successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error creating role:", error);
    logger.error("Error creating role: " + error.message);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to create role",
    });
  }
};

/**
 * ✅ GET ROLE BY ID
 */
export const getRoleById = async (req, res) => {
  const { roleId } = req.query;
  try {
    console.log("📥 API Call: GET /rolemaster/getrole");
    console.log("Role ID:", roleId);

    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({
        status: false,
        message: "Role not found",
      });
    }

    console.log("✅ Role fetched:", roleId);

    return res.status(200).json({
      status: true,
      message: "Role fetched successfully",
      data: role,
    });
  } catch (error) {
    console.error("❌ Error fetching role:", error);
    logger.error(`Error while getting the role: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: "Error while getting the role by ID: " + error.message,
    });
  }
};

/**
 * ✅ GET ALL ROLES
 */
export const getAllRoles = async (req, res) => {
  try {
    console.log("📥 API Call: GET /rolemaster/getallroles");

    const roles = await RoleService.getAllRoles();

    console.log("✅ Roles fetched:", roles.length);

    return res.status(200).json({
      status: true,
      message: "All roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    console.error("❌ Error fetching roles:", error);
    logger.error("Error fetching roles: " + error);
    return res.status(500).json({
      status: false,
      message: "Error fetching roles: " + error.message,
    });
  }
};

/**
 * ✅ GET ROLES BY DEPARTMENT & CATEGORY
 */
export const getRolesByDeptCat = async (req, res) => {
  const { department_id, category_id } = req.query;
  try {
    console.log("📥 API Call: GET /rolemaster/getrolesbydeptcat");
    console.log("Filters:", { department_id, category_id });

    const roles = await Role.find({
      department_id,
      category_id,
    }).sort({ role_name: 1 });

    console.log("✅ Roles fetched by dept & category:", roles.length);

    return res.status(200).json({
      status: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    console.error("❌ Error fetching roles:", error);
    logger.error("Error fetching roles by dept & category: " + error);
    return res.status(500).json({
      status: false,
      message: "Error fetching roles: " + error.message,
    });
  }
};

/**
 * ✅ UPDATE ROLE
 */
export const updateRoleById = async (req, res) => {
  const { roleId } = req.query;
  try {
    console.log("📥 API Call: PUT /rolemaster/update");
    console.log("Role ID:", roleId);
    console.log("Update Data:", req.body);

    // Check if role exists
    const existingRole = await Role.findById(roleId);
    if (!existingRole) {
      return res.status(404).json({
        status: false,
        message: "Role not found",
      });
    }

    const updated = await Role.findByIdAndUpdate(roleId, req.body, {
      new: true,
    });

    console.log("✅ Role updated:", roleId);

    return res.status(200).json({
      status: true,
      message: "Role updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updating role:", error);
    logger.error(`Error updating role: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: "Error updating role: " + error.message,
    });
  }
};

/**
 * ✅ DELETE ROLE (matches route: deleteRole)
 */
export const deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    console.log("📥 API Call: DELETE /rolemaster/delete/:id");
    console.log("Role ID:", id);

    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({
        status: false,
        message: "Role not found",
      });
    }

    const deleted = await Role.findByIdAndDelete(id);

    console.log("✅ Role deleted:", id);
    console.log("   Name:", deleted.role_name);

    return res.status(200).json({
      status: true,
      message: "Role deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("❌ Error deleting role:", error);
    logger.error(`Error deleting role: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: "Error deleting role: " + error.message,
    });
  }
};

/**
 * ✅ GET ROLES BY CATEGORY (matches route: getRolesByCategory)
 */
export const getRolesByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    console.log("📥 API Call: GET /rolemaster/by-category/:categoryId");
    console.log("Category ID:", categoryId);

    const roles = await Role.find({ category_id: categoryId }).sort({
      role_name: 1,
    });

    console.log("✅ Roles fetched by category:", roles.length);

    return res.status(200).json({
      status: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    console.error("❌ Error fetching roles:", error);
    logger.error("Error fetching roles by category: " + error);
    return res.status(500).json({
      status: false,
      message: "Error fetching roles: " + error.message,
    });
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
export default {
  createRole,
  getRoleById,
  getAllRoles,
  getRolesByCategory,
  getRolesByDeptCat,
  updateRoleById,
  deleteRole,
};

/**
 * ============================================
 * FILE NAMING CONVENTION:
 * ============================================
 * 
 * In /src/module/role master/ directory:
 * 
 * ✅ role.model.js          (import: ./role.model.js)
 * ✅ rolem.controller.js    (import: ./rolem.controller.js)
 * ✅ rolem.service.js       (import: ./rolem.service.js)
 * ✅ rolem.route.js         (import: ./rolem.route.js)
 * 
 * This controller uses:
 * - import RoleService from "./rolem.service.js";
 * - import Role from "./role.model.js";
 * 
 * ============================================
 * FEATURES:
 * ============================================
 * 
 * ✅ STORES DEPARTMENT & CATEGORY NAMES:
 *    department_name: Stored in database
 *    category_name: Stored in database
 * 
 * ✅ AUTO-GENERATES ROLE ID:
 *    Uses IdcodeServices
 *    Format: RAC001, RAC002, RAC003, etc.
 * 
 * ✅ VALIDATES ALL FIELDS:
 *    role_name (required)
 *    department_id (required)
 *    department_name (required)  ← NEW!
 *    category_id (required)
 *    category_name (required)    ← NEW!
 * 
 * ✅ PROPER ERROR HANDLING:
 *    Validates each field
 *    Specific error messages
 *    Detailed logging
 * 
 * ✅ DATABASE OPERATIONS:
 *    CREATE: Role.create(data)
 *    READ: Role.findById() / RoleService.getAllRoles()
 *    UPDATE: Role.findByIdAndUpdate()
 *    DELETE: Role.findByIdAndDelete()
 */
