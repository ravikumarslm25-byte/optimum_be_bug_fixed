// ====================================
// FILE: src/module/category/category.model.js
// CATEGORY MODEL - FIXED SCHEMA
// ====================================

import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    // ✅ CATEGORY ID (Auto-generated: CAT001, CAT002, etc.)
    category_id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    // ✅ CATEGORY NAME (Required)
    category_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ✅ DEPARTMENT ID (Reference to Department)
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },

    // ✅ DEPARTMENT NAME (Denormalized for quick access)
    department_name: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ STATUS (Active/Inactive)
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);

// ============================================
// SAMPLE DOCUMENT IN MONGODB:
// ============================================
/*
{
  "_id": ObjectId("507f1f77bcf86cd799439021"),
  "category_id": "CAT001",
  "category_name": "Frontend Development",
  "department_id": ObjectId("507f1f77bcf86cd799439011"),
  "department_name": "Development",
  "status": "Active",
  "createdAt": ISODate("2026-03-15T10:00:00.000Z"),
  "updatedAt": ISODate("2026-03-15T10:00:00.000Z"),
  "__v": 0
}

{
  "_id": ObjectId("507f1f77bcf86cd799439022"),
  "category_id": "CAT002",
  "category_name": "Backend Development",
  "department_id": ObjectId("507f1f77bcf86cd799439011"),
  "department_name": "Development",
  "status": "Active",
  "createdAt": ISODate("2026-03-15T10:01:00.000Z"),
  "updatedAt": ISODate("2026-03-15T10:01:00.000Z"),
  "__v": 0
}
*/

// ============================================
// ID CODE GENERATION IN IDCODES COLLECTION:
// ============================================
/*
idcodes collection:
{
  "_id": ObjectId(...),
  "idname": "Category",
  "idcode": "CAT",
  "codes": 2
}

Each call to generateCode("Category") increments codes and returns:
1st call: "CAT001"
2nd call: "CAT002"
3rd call: "CAT003"
etc.
*/
