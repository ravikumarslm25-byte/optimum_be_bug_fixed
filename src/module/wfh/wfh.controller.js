// ====================================
// FILE: src/module/wfh/wfh.controller.js
// COMPLETE WFH CONTROLLER (UPDATED)
// ====================================

import WFH from "./wfh.model.js";
import Employee from "../employee/employee.model.js";

// ✅ GET ALL WFH REQUESTS (Main function for listing)
export const getAllWFH = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/wfh/list");

    // Get all WFH requests sorted by date, populated with employee details
    const wfhRequests = await WFH.find()
      .populate("employee_id", "name email jobTitle department employeeId")
      .sort({ start_date: -1 });

    console.log("✅ WFH requests fetched:", wfhRequests.length);

    return res.status(200).json({
      status: true,
      message: "WFH requests fetched successfully",
      data: wfhRequests || [],
    });
  } catch (error) {
    console.error("❌ Error fetching WFH requests:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch WFH requests",
    });
  }
};

// ✅ LIST ALL WFH (Alternative endpoint)
export const listWFH = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/wfh/list");

    const wfhRequests = await WFH.find()
      .populate("employee_id", "name email jobTitle department employeeId")
      .sort({ start_date: -1 });

    console.log("✅ WFH requests listed:", wfhRequests.length);

    return res.status(200).json({
      status: true,
      message: "WFH requests fetched successfully",
      data: wfhRequests || [],
    });
  } catch (error) {
    console.error("❌ Error listing WFH requests:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch WFH requests",
    });
  }
};

// ✅ GET WFH BY ID
export const getWFHById = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/wfh/:id");
    console.log("WFH ID:", req.params.id);

    const { id } = req.params;

    const wfh = await WFH.findById(id).populate(
      "employee_id",
      "name email jobTitle department employeeId"
    );

    if (!wfh) {
      return res.status(404).json({
        status: false,
        message: "WFH request not found",
      });
    }

    console.log("✅ WFH found:", id);

    return res.status(200).json({
      status: true,
      message: "WFH request fetched successfully",
      data: wfh,
    });
  } catch (error) {
    console.error("❌ Error fetching WFH:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch WFH request",
    });
  }
};

// ✅ CREATE WFH REQUEST (HR applies for employee)
export const createWFH = async (req, res) => {
  try {
    console.log("📥 API Call: POST /api/wfh/apply");
    console.log("Request Body:", req.body);

    const {
      employee_id,
      employee_name,
      start_date,
      end_date,
      reason,
      number_of_days,
      wfh_type,
      applied_by, // "HR" or employee name
    } = req.body;

    // ✅ VALIDATION
    if (!employee_id || !employee_id.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Employee ID is required",
      });
    }

    if (!start_date) {
      return res.status(400).json({
        status: false,
        message: "Start date is required",
      });
    }

    if (!end_date) {
      return res.status(400).json({
        status: false,
        message: "End date is required",
      });
    }

    if (!number_of_days) {
      return res.status(400).json({
        status: false,
        message: "Number of days is required",
      });
    }

    // ✅ CREATE NEW WFH REQUEST
    const newWFH = new WFH({
      employee_id: employee_id.toString().trim(),
      employee_name: employee_name ? employee_name.toString().trim() : "",
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      reason: reason ? reason.toString().trim() : "",
      number_of_days: Number(number_of_days),
      wfh_type: wfh_type ? wfh_type.toString().toUpperCase() : "FULL_DAY",
      status: "PENDING",
      applied_by: applied_by || "HR", // Track who applied
    });

    const savedWFH = await newWFH.save();

    console.log("✅ WFH request created:", savedWFH._id);

    return res.status(201).json({
      status: true,
      message: "WFH request applied successfully",
      data: savedWFH,
    });
  } catch (error) {
    console.error("❌ Error creating WFH:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to apply WFH request",
    });
  }
};

// ✅ APPROVE WFH
export const approveWFH = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /api/wfh/:id/approve");
    console.log("WFH ID:", req.params.id);

    const { id } = req.params;
    const { approved_by } = req.body;

    const wfh = await WFH.findById(id);

    if (!wfh) {
      return res.status(404).json({
        status: false,
        message: "WFH request not found",
      });
    }

    // ✅ Check if already processed
    if (wfh.status !== "PENDING") {
      return res.status(400).json({
        status: false,
        message: `WFH request is already ${wfh.status.toLowerCase()}`,
      });
    }

    wfh.status = "APPROVED";
    wfh.approved_by = approved_by || "ADMIN";
    wfh.approved_date = new Date();

    const updatedWFH = await wfh.save();

    // ✅ UPDATE EMPLOYEE'S wfhApproved FIELD TO TRUE
    if (wfh.employee_id) {
      await Employee.findByIdAndUpdate(
        wfh.employee_id,
        { wfhApproved: true },
        { new: true }
      );
      console.log("📝 Employee wfhApproved updated to true");
    }

    console.log("✅ WFH approved:", id);

    return res.status(200).json({
      status: true,
      message: "WFH request approved successfully",
      data: updatedWFH,
    });
  } catch (error) {
    console.error("❌ Error approving WFH:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to approve WFH request",
    });
  }
};

// ✅ REJECT WFH
export const rejectWFH = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /api/wfh/:id/reject");
    console.log("WFH ID:", req.params.id);

    const { id } = req.params;
    const { approved_by, rejection_reason } = req.body;

    const wfh = await WFH.findById(id);

    if (!wfh) {
      return res.status(404).json({
        status: false,
        message: "WFH request not found",
      });
    }

    // ✅ Check if already processed
    if (wfh.status !== "PENDING") {
      return res.status(400).json({
        status: false,
        message: `WFH request is already ${wfh.status.toLowerCase()}`,
      });
    }

    wfh.status = "REJECTED";
    wfh.approved_by = approved_by || "ADMIN";
    wfh.rejection_reason = rejection_reason || "";
    wfh.approved_date = new Date();

    const updatedWFH = await wfh.save();

    console.log("✅ WFH rejected:", id);

    return res.status(200).json({
      status: true,
      message: "WFH request rejected successfully",
      data: updatedWFH,
    });
  } catch (error) {
    console.error("❌ Error rejecting WFH:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to reject WFH request",
    });
  }
};

// ✅ DELETE WFH
export const deleteWFH = async (req, res) => {
  try {
    console.log("📥 API Call: DELETE /api/wfh/:id");
    console.log("WFH ID:", req.params.id);

    const { id } = req.params;

    const wfh = await WFH.findByIdAndDelete(id);

    if (!wfh) {
      return res.status(404).json({
        status: false,
        message: "WFH request not found",
      });
    }

    console.log("✅ WFH deleted:", id);

    return res.status(200).json({
      status: true,
      message: "WFH request deleted successfully",
      data: wfh,
    });
  } catch (error) {
    console.error("❌ Error deleting WFH:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to delete WFH request",
    });
  }
};

// ✅ GET WFH BY EMPLOYEE
export const getWFHByEmployee = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/wfh/employee/:employeeId");
    console.log("Employee ID:", req.params.employeeId);

    const { employeeId } = req.params;

    const wfhRequests = await WFH.find({ employee_id: employeeId })
      .populate("employee_id", "name email jobTitle department")
      .sort({ start_date: -1 });

    console.log("✅ Found", wfhRequests.length, "WFH requests for employee");

    return res.status(200).json({
      status: true,
      message: "WFH requests fetched successfully",
      data: wfhRequests,
    });
  } catch (error) {
    console.error("❌ Error fetching WFH requests:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch WFH requests",
    });
  }
};

// ✅ GET WFH BY STATUS
export const getWFHByStatus = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/wfh/status/:status");
    console.log("Status:", req.params.status);

    const { status } = req.params;

    const wfhRequests = await WFH.find({ status })
      .populate("employee_id", "name email jobTitle department")
      .sort({ start_date: -1 });

    console.log("✅ Found", wfhRequests.length, "WFH requests with status:", status);

    return res.status(200).json({
      status: true,
      message: "WFH requests fetched successfully",
      data: wfhRequests,
    });
  } catch (error) {
    console.error("❌ Error fetching WFH requests:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch WFH requests",
    });
  }
};

// ✅ GET WFH COUNT
export const getWFHCount = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/wfh/count");

    const totalWFH = await WFH.countDocuments();
    const pendingWFH = await WFH.countDocuments({ status: "PENDING" });
    const approvedWFH = await WFH.countDocuments({ status: "APPROVED" });
    const rejectedWFH = await WFH.countDocuments({ status: "REJECTED" });

    console.log("✅ WFH counts fetched");

    return res.status(200).json({
      status: true,
      message: "WFH count fetched successfully",
      data: {
        total: totalWFH,
        pending: pendingWFH,
        approved: approvedWFH,
        rejected: rejectedWFH,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching WFH count:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch WFH count",
    });
  }
};

// ============================================
// ✅ PROFILE SECTION - NEW WFH APIs (FOR LOGGED-IN USER ONLY)
// ============================================

/**
 * ✅ APPLY WFH - FOR LOGGED-IN EMPLOYEE (PROFILE SECTION)
 * POST /api/wfh/profile/apply/:employee_id
 * 
 * Used by: Profile section only
 * Only the logged-in employee can apply WFH for themselves
 * Uses employee_id (STRING) to find employee
 */
export const applyWFHProfile = async (req, res) => {
  try {
    console.log("📥 API Call: POST /api/wfh/profile/apply/:employee_id");
    console.log("Employee ID:", req.params.employee_id);
    console.log("Request Body:", req.body);

    const { employee_id } = req.params;
    const {
      wfh_type,
      start_date,
      end_date,
      reason,
      number_of_days,
    } = req.body;

    // ✅ VALIDATION
    if (!employee_id || !employee_id.trim()) {
      return res.status(400).json({
        status: false,
        message: "Employee ID is required",
      });
    }

    if (!start_date) {
      return res.status(400).json({
        status: false,
        message: "Start date is required",
      });
    }

    if (!end_date) {
      return res.status(400).json({
        status: false,
        message: "End date is required",
      });
    }

    if (!number_of_days) {
      return res.status(400).json({
        status: false,
        message: "Number of days is required",
      });
    }

    // ✅ FIND EMPLOYEE BY employee_id STRING
    const employee = await Employee.findOne({ employee_id: employee_id.trim() });

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    // ✅ CREATE NEW WFH REQUEST
    const newWFH = new WFH({
      employee_id: employee._id,  // ✅ USE MongoDB _id
      employee_name: employee.name,
      wfh_type: wfh_type || "FULL_DAY",
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      reason: reason ? reason.toString().trim() : "",
      number_of_days: Number(number_of_days),
      applied_by: "Employee",  // ✅ Mark as applied by employee (not HR)
      status: "PENDING",
    });

    const savedWFH = await newWFH.save();

    console.log("✅ WFH created successfully for employee:", employee_id);

    return res.status(201).json({
      status: true,
      message: "WFH applied successfully",
      data: savedWFH,
    });
  } catch (error) {
    console.error("❌ Error applying WFH:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to apply WFH",
    });
  }
};

/**
 * ✅ GET WFH HISTORY - FOR LOGGED-IN EMPLOYEE (PROFILE SECTION)
 * GET /api/wfh/profile/history/:employee_id
 * 
 * Used by: Profile section only
 * Only the logged-in employee can view their own WFH history
 * Uses employee_id (STRING) to find employee
 */
export const getWFHHistoryProfile = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/wfh/profile/history/:employee_id");
    console.log("Employee ID:", req.params.employee_id);

    const { employee_id } = req.params;

    // ✅ VALIDATION
    if (!employee_id || !employee_id.trim()) {
      return res.status(400).json({
        status: false,
        message: "Employee ID is required",
      });
    }

    // ✅ FIND EMPLOYEE BY employee_id STRING
    const employee = await Employee.findOne({ employee_id: employee_id.trim() });

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    // ✅ GET ALL WFH RECORDS FOR THIS EMPLOYEE (Sort by newest first)
    const wfhRecords = await WFH.find({ employee_id: employee._id })  // ✅ USE MongoDB _id
      .sort({ createdAt: -1 });

    console.log("✅ WFH history fetched for employee:", employee_id);

    return res.status(200).json({
      status: true,
      message: "WFH history fetched successfully",
      data: wfhRecords || [],
    });
  } catch (error) {
    console.error("❌ Error fetching WFH history:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch WFH history",
    });
  }
};

// ✅ EXPORT ALL FUNCTIONS
export default {
  getAllWFH,
  listWFH,
  getWFHById,
  createWFH,
  approveWFH,
  rejectWFH,
  deleteWFH,
  getWFHByEmployee,
  getWFHByStatus,
  getWFHCount,
  applyWFHProfile,           // ✅ NEW
  getWFHHistoryProfile,      // ✅ NEW
};
