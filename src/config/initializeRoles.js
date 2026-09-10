import mongoose from "mongoose";
import logger from "./logger.js";

/**
 * ✅ DIAGNOSTIC: LIST ALL ROLES IN DATABASE
 * 
 * This function shows you all roles currently in the database
 * so you can see what role names actually exist
 */
export const listAllRoles = async () => {
  try {
    console.log("📊 Fetching all roles from database...");
    
    const RoleModel = mongoose.model("roles");
    const allRoles = await RoleModel.find({}, { role_name: 1, name: 1, role_id: 1 });

    if (allRoles.length === 0) {
      console.log("⚠️  No roles found in database");
      return;
    }

    console.log("\n════════════════════════════════════════");
    console.log("📋 ROLES IN DATABASE:");
    console.log("════════════════════════════════════════");
    
    allRoles.forEach((role, index) => {
      console.log(`${index + 1}. Role Name: ${role.role_name || role.name}`);
      console.log(`   Role ID: ${role.role_id || role._id}`);
      console.log("---");
    });

    console.log("════════════════════════════════════════\n");

  } catch (error) {
    console.error("❌ Error listing roles:", error);
    logger.error("Error listing roles: " + error.message);
  }
};

/**
 * ✅ FIXED: AUTO-ADD WEBSITE MODULES TO ROLES
 * 
 * Now searches for Admin role more flexibly:
 * - Checks "role_name" field
 * - Checks "name" field
 * - Case-insensitive search
 */

const websiteFeatures = [
  {
    feature: "WebsiteForms",
    permissions: ["View", "Create", "Edit", "Delete"]
  },
  {
    feature: "WebsiteBlog",
    permissions: ["View", "Create", "Edit", "Delete", "Publish"]
  },
  {
    feature: "WebsiteMedia",
    permissions: ["View", "Create", "Edit", "Delete"]
  },
  {
    feature: "WebsiteCareers",
    permissions: ["View", "Create", "Edit", "Delete"]
  }
];

export const initializeWebsiteRoles = async (roleName = "CEO") => {
  try {
    console.log("🔄 Initializing website module roles...");
    console.log(`🔍 Searching for role: "${roleName}"`);

    const RoleModel = mongoose.model("roles");

    // Search for role - try multiple field names and case-insensitive
    let adminRole = await RoleModel.findOne({
      $or: [
        { role_name: new RegExp(`^${roleName}$`, "i") },
        { name: new RegExp(`^${roleName}$`, "i") },
        { role_name: roleName },
        { name: roleName }
      ]
    });

    if (!adminRole) {
      console.log(`⚠️  "${roleName}" role not found in database`);
      console.log("📝 To see available roles, check the database or run listAllRoles()");
      logger.warn(`${roleName} role not found`);
      return;
    }

    console.log(`✅ Found role: ${adminRole.role_name || adminRole.name}`);

    // Initialize accessLevels if it doesn't exist
    if (!adminRole.accessLevels) {
      adminRole.accessLevels = [];
    }

    let addedCount = 0;
    let existingCount = 0;

    // Check each website feature
    for (const newFeature of websiteFeatures) {
      const featureExists = adminRole.accessLevels.some(
        (level) => level.feature === newFeature.feature
      );

      if (!featureExists) {
        console.log(`📝 Adding feature: ${newFeature.feature}`);
        adminRole.accessLevels.push(newFeature);
        addedCount++;
      } else {
        console.log(`✅ Feature already exists: ${newFeature.feature}`);
        existingCount++;
      }
    }

    // Save if changes were made
    if (addedCount > 0) {
      await adminRole.save();
      console.log(`\n✅ Successfully added ${addedCount} new features`);
      console.log(`✅ ${existingCount} features already existed`);
      logger.info(`Website features added to ${roleName} role`);
    } else {
      console.log(`\n✅ All 4 website features already exist in ${roleName} role`);
    }

  } catch (error) {
    console.error("❌ Error initializing website roles:", error);
    logger.error("Error initializing website roles: " + error.message);
  }
};

export default initializeWebsiteRoles;

/**
 * ============================================
 * HOW TO USE THIS FIXED VERSION:
 * ============================================
 * 
 * IN YOUR app.js or db.js:
 * 
 * import initializeWebsiteRoles, { listAllRoles } from "./initializeRoles.js";
 * 
 * mongoose.connection.once("open", async () => {
 *   console.log("📊 Database connected");
 *   
 *   // OPTION 1: Auto-initialize "admin" role (default)
 *   await initializeWebsiteRoles();
 *   
 *   // OPTION 2: Initialize a different role (e.g., "CEO")
 *   // await initializeWebsiteRoles("CEO");
 *   
 *   // OPTION 3: List all roles to see what exists
 *   // await listAllRoles();
 * });
 * 
 * ============================================
 * IF ADMIN ROLE NOT FOUND:
 * ============================================
 * 
 * 1. Run this to see all roles in your database:
 *    await listAllRoles();
 * 
 * 2. Find the exact role name (e.g., "ceo", "CEO", "Admin", etc.)
 * 
 * 3. Use that name when calling:
 *    await initializeWebsiteRoles("ceo");
 * 
 * 4. Or manually create Admin role in MongoDB:
 *    db.roles.insertOne({
 *      role_name: "admin",
 *      role_id: "RAC001",
 *      department_id: "DEPT001",
 *      department_name: "admin",
 *      category_id: "CAT001",
 *      category_name: "admin",
 *      accessLevels: [],
 *      status: "active",
 *      created_by_user: "System"
 *    })
 */
