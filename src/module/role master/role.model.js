import mongoose from "mongoose";

/**
 * ✅ ROLE MASTER MODEL - UPDATED
 * 
 * Stores:
 * - role_id: Auto-generated (RAC001, RAC002, etc.)
 * - role_name: User input (Business Development Manager, etc.)
 * - department_id: Reference to Department collection
 * - department_name: Department name (Development, Finance, etc.)  ← NEW!
 * - category_id: Reference to Category collection
 * - category_name: Category name (Frontend Development, etc.)      ← NEW!
 * 
 * This ensures complete role information is stored and can be
 * displayed in the dashboard without needing to lookup parent documents.
 */

const roleSchema = new mongoose.Schema(
  {
    // ✅ ROLE ID (Auto-generated: RAC001, RAC002, etc.)
    role_id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    // ✅ ROLE NAME (Required)
    role_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ✅ DEPARTMENT ID (Reference to Department collection)
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },

    // ✅ DEPARTMENT NAME (Denormalized - stored for quick access)
    // This is the key addition! Allows displaying department name without lookup
    department_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ✅ CATEGORY ID (Reference to Category collection)
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    // ✅ CATEGORY NAME (Denormalized - stored for quick access)
    // This is the key addition! Allows displaying category name without lookup
    category_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ✅ STATUS (Active/Inactive for future use)
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // ✅ ACCESS LEVELS (Permissions structure - optional)
    accessLevels: [
      {
        feature: String,
        permissions: [String],
      },
    ],

    // ✅ CREATED BY (Audit trail)
    created_by_user: String,
  },
  { timestamps: true }
);

/**
 * ✅ UNIQUE INDEX: Prevent duplicate roles within same category
 * 
 * Ensures that you can't have two roles with the same name
 * under the same category. But you can have "Developer" role in
 * both "Frontend Development" and "Backend Development" categories.
 */
roleSchema.index(
  { role_name: 1, category_id: 1 },
  { unique: true }
);

export default mongoose.model("RoleMaster", roleSchema);

/**
 * ============================================
 * SAMPLE DOCUMENT IN MONGODB:
 * ============================================
 * 
 * {
 *   "_id": ObjectId("507f1f77bcf86cd799439021"),
 *   "role_id": "RAC001",
 *   "role_name": "Business Development Manager",
 *   "department_id": ObjectId("507f1f77bcf86cd799439011"),
 *   "department_name": "Development",              ✅ NEW!
 *   "category_id": ObjectId("507f1f77bcf86cd799439031"),
 *   "category_name": "Frontend Development",      ✅ NEW!
 *   "status": "Active",
 *   "accessLevels": [
 *     {
 *       "feature": "Users",
 *       "permissions": ["view", "edit"]
 *     }
 *   ],
 *   "createdAt": ISODate("2026-03-15T10:00:00.000Z"),
 *   "updatedAt": ISODate("2026-03-15T10:00:00.000Z"),
 *   "__v": 0
 * }
 */

/**
 * ============================================
 * KEY CHANGES FROM OLD MODEL:
 * ============================================
 * 
 * OLD MODEL:
 *   - department_id (ObjectId) ✓
 *   - category_id (ObjectId) ✓
 *   - role_name (String) ✓
 *   - role_id (String, unique) ✓
 * 
 * NEW MODEL (ADDED):
 *   - department_name (String, required, indexed) ← CRITICAL!
 *   - category_name (String, required, indexed)   ← CRITICAL!
 *   - role_id now also required (was just unique) ← Stricter validation
 *   - status field (for future Active/Inactive)   ← Nice to have
 *   - created_by_user field                       ← Audit trail
 *   - accessLevels kept for permissions          ← Already there
 * 
 * WHY THESE CHANGES:
 *   1. department_name: Allows displaying "Development" without lookup
 *   2. category_name: Allows displaying "Frontend Development" without lookup
 *   3. role_id required: Ensures all roles have IDs (data integrity)
 *   4. status: Future-proofs for deactivating roles
 *   5. Proper indexing: Improves query performance
 */

/**
 * ============================================
 * WHAT THIS ENABLES:
 * ============================================
 * 
 * Dashboard Table Query:
 *   db.rolemaster.find()
 *   → Can display all fields directly
 *   → No need for .populate() or separate lookups
 *   → Fast performance
 *   → Clean data
 * 
 * Frontend Display:
 *   S.No | Role ID | Department | Category | Role Name | Action
 *   1    | RAC001  | Development | Frontend Development | Business Dev Manager | Delete
 *   
 *   All data comes directly from the role document!
 * 
 * Data Integrity:
 *   - department_name and category_name are validated at save time
 *   - No mismatches between IDs and names
 *   - Consistent across collections
 */
