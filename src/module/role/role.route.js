import { Router } from 'express';
import { getAvailableFeatures, createRole, deleteRoleById, getAllRoles, getRoleById, getRolesByDeptCat, updateRoleById } from './role.controller.js';

const roleRoute = Router();

// ✅ NEW ENDPOINT - Get available features for role creation
roleRoute.get("/features", getAvailableFeatures);

// ✅ EXISTING ENDPOINTS (unchanged)
roleRoute.post("/add", createRole);
roleRoute.get("/all", getAllRoles);
roleRoute.get("/bydeptcategory", getRolesByDeptCat);
roleRoute.get("/byid", getRoleById);
roleRoute.put("/update", updateRoleById);
roleRoute.delete("/delete", deleteRoleById);

export default roleRoute;

/**
 * ============================================
 * API ENDPOINTS AFTER UPDATE:
 * ============================================
 * 
 * ✅ GET /role/features
 *    - Returns list of all available features
 *    - Includes: Dashboard, Tasks, Leads, Campaigns, etc.
 *    - PLUS: WebsiteForms, WebsiteBlog, WebsiteMedia, WebsiteCareers
 *    - Used by frontend for role creation/editing
 *
 * ✅ POST /role/add
 *    - Create new role
 *
 * ✅ GET /role/all
 *    - Get all roles
 *
 * ✅ GET /role/bydeptcategory
 *    - Filter roles by department & category
 *
 * ✅ GET /role/byid
 *    - Get role by ID
 *
 * ✅ PUT /role/update
 *    - Update role
 *
 * ✅ DELETE /role/delete
 *    - Delete role
 */
