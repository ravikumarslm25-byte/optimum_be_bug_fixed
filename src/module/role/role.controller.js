import logger from "../../config/logger.js";
import Role from "./role.model.js";

/**
 * ✅ GET ALL AVAILABLE FEATURES
 * 
 * NEW ENDPOINT - REQUIRED FOR FRONTEND ROLE ACCESS PAGE
 * Returns the list of features that can be assigned to roles
 */
export const getAvailableFeatures = async (req, res) => {
  try {
    console.log("📥 API Call: GET /role/features");

    const availableFeatures = [
      "Dashboard",
      "Tasks",
      "Leads",
      "Campaigns",
      "Association",
      "Appointments",
      "Finance",
      "HR",
      "Reports",
      "Settings",
      "WebsiteForms",      // ✅ NEW - Website Forms
      "WebsiteBlog",       // ✅ NEW - Blog Management
      "WebsiteMedia",      // ✅ NEW - Media Coverage
      "WebsiteCareers"     // ✅ NEW - Careers Management
    ];

    console.log("✅ Available features fetched:", availableFeatures.length);

    return res.status(200).json({
      status: true,
      message: "Available features fetched successfully",
      data: availableFeatures,
    });
  } catch (error) {
    console.error("❌ Error fetching available features:", error);
    logger.error("Error fetching available features: " + error.message);
    return res.status(500).json({
      status: false,
      message: "Error fetching features: " + error.message,
    });
  }
};

/**
 * ✅ CREATE ROLE ACCESS
 * 
 * Stores to "roles" collection with:
 * - role_id, role_name
 * - department_id, department_name (NEW)
 * - category_id, category_name (NEW)
 * - accessLevels
 * - status, created_by_user
 * - timestamps (auto)
 */
export const createRole = async (req, res) => {
  try {
    console.log("📥 API Call: POST /role/add");
    console.log("Request Body:", req.body);

    const {
      role_id,
      role_name,
      department_id,
      department_name,
      category_id,
      category_name,
      accessLevels,
      status,
    } = req.body;

    // ✅ VALIDATION
    if (!role_id || !role_id.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Role ID is required",
      });
    }

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

    // ✅ BUILD ROLE DATA
    const roleData = {
      role_id,
      role_name: role_name.toString().trim(),
      department_id: department_id.toString().trim(),
      department_name: department_name.toString().trim(),
      category_id: category_id.toString().trim(),
      category_name: category_name.toString().trim(),
      accessLevels: accessLevels || [],
      status: status || "active",
      created_by_user: "System",
    };

    console.log("📤 Saving role data:", roleData);

    // ✅ CREATE IN DATABASE
    const result = await Role.create(roleData);

    console.log("✅ Role created successfully");
    console.log("   Role ID:", result.role_id);
    console.log("   Role Name:", result.role_name);
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
    console.log("📥 API Call: GET /role/get");
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
    logger.error(`Error fetching role: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: "Error fetching role: " + error.message,
    });
  }
};

/**
 * ✅ GET ALL ROLES
 */
export const getAllRoles = async (req, res) => {
  try {
    console.log("📥 API Call: GET /role/all");

    const roles = await Role.find().sort({ createdAt: -1 });

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
    console.log("📥 API Call: GET /role/getByDeptCat");
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
    console.log("📥 API Call: PUT /role/update");
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
 * ✅ DELETE ROLE
 */
export const deleteRoleById = async (req, res) => {
  const { roleId } = req.query;
  try {
    console.log("📥 API Call: DELETE /role/delete");
    console.log("Role ID:", roleId);

    // Check if role exists
    const existingRole = await Role.findById(roleId);
    if (!existingRole) {
      return res.status(404).json({
        status: false,
        message: "Role not found",
      });
    }

    const deleted = await Role.findByIdAndDelete(roleId);

    console.log("✅ Role deleted:", roleId);
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

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
export default {
  getAvailableFeatures,  // ✅ NEW EXPORT
  createRole,
  getRoleById,
  getAllRoles,
  getRolesByDeptCat,
  updateRoleById,
  deleteRoleById,
};

/**
 * ============================================
 * KEY CHANGES:
 * ============================================
 * 
 * ✅ NEW: getAvailableFeatures() function
 *    - Returns list of all available features
 *    - Includes 4 website modules (WebsiteForms, WebsiteBlog, WebsiteMedia, WebsiteCareers)
 *    - Used by frontend for role creation/editing
 * 
 * ✅ Exported in default export
 * ✅ All existing functions preserved
 * ✅ No breaking changes
 */
