import mongoose from "mongoose";

/**
 * ✅ ROLE ACCESS SCHEMA
 * 
 * Collection: "roles" (EXISTING - NO CHANGE)
 * 
 * ONLY ADDING:
 * - department_name (String)
 * - category_name (String)
 * 
 * All other fields remain the same!
 */

const RoleAccessSchema = new mongoose.Schema(
  {
    // ✅ EXISTING FIELDS (DO NOT CHANGE)
    role_id: {
      type: String,
      required: true,
      unique: true,
    },

    role_name: {
      type: String,
      required: true,
    },

    department_id: {
      type: String,
      required: true,
    },

    category_id: {
      type: String,
      required: true,
    },

    accessLevels: [
      {
        feature: String,
        permissions: [String],
      },
    ],

    status: {
      type: String,
      default: "active",
    },

    created_by_user: String,

    // ✅ NEW FIELDS ONLY (ADDING)
    department_name: {
      type: String,
      required: true,
    },

    category_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("roles", RoleAccessSchema);

/**
 * ============================================
 * COLLECTION STRUCTURE (MongoDB):
 * ============================================
 * 
 * {
 *   "_id": ObjectId("6960ddd1d6c01e6f856128de"),
 *   "role_id": "RAC002",
 *   "role_name": "ceo",
 *   "department_id": "6964ee167aa251cdb5069b7c",
 *   "department_name": "admin",                    ✅ NEW!
 *   "category_id": "6964ee777aa251cdb5069b83",
 *   "category_name": "admin",                      ✅ NEW!
 *   "accessLevels": [
 *     { "feature": "Dashboard", "permissions": ["View"] },
 *     { "feature": "Leads", "permissions": ["View", "Create", "Edit"] },
 *     { "feature": "Tasks", "permissions": [...] }
 *   ],
 *   "status": "active",
 *   "created_by_user": "System",
 *   "createdAt": ISODate("2026-01-09T10:52:01.608Z"),
 *   "updatedAt": ISODate("2026-01-09T11:45:39.174Z"),
 *   "__v": 0
 * }
 */

/**
 * ============================================
 * WHAT'S NEW:
 * ============================================
 * 
 * ✅ department_name: String (NEW)
 *    - Stores the human-readable department name
 *    - Used for displaying in tables without lookups
 * 
 * ✅ category_name: String (NEW)
 *    - Stores the human-readable category name
 *    - Used for displaying in tables without lookups
 * 
 * ✅ Collection name: "roles" (UNCHANGED)
 * ✅ All existing fields: UNCHANGED
 * ✅ Timestamps: Auto-managed (UNCHANGED)
 */
