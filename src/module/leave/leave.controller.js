// ====================================
// FILE: src/module/leave/leave.controller.js
// COMPLETE LEAVE CONTROLLER
// ====================================

import Leave from "./leave.model.js";
import Employee from "../employee/employee.model.js";

// ✅ GET ALL LEAVES (Main function for listing all leaves)
export const getAllLeaves = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/leave/list");

    // Get all leaves and populate employee details
    const leaves = await Leave.find()
      .populate("employee_id", "name email jobTitle department employeeId")
      .sort({ createdAt: -1 });

    console.log("✅ Leaves fetched:", leaves.length);

    return res.status(200).json({
      status: true,
      message: "Leaves fetched successfully",
      data: leaves || [],
    });
  } catch (error) {
    console.error("❌ Error fetching leaves:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch leaves",
    });
  }
};

// ✅ LIST ALL LEAVES (Alternative endpoint - same as getAllLeaves)
export const listLeaves = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/leave/list");

    const leaves = await Leave.find()
      .populate("employee_id", "name email jobTitle department employeeId")
      .sort({ createdAt: -1 });

    console.log("✅ Leaves listed:", leaves.length);

    return res.status(200).json({
      status: true,
      message: "Leaves fetched successfully",
      data: leaves || [],
    });
  } catch (error) {
    console.error("❌ Error listing leaves:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch leaves",
    });
  }
};

// ✅ GET LEAVE BY ID
export const getLeaveById = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/leave/:id");
    console.log("Leave ID:", req.params.id);

    const { id } = req.params;

    const leave = await Leave.findById(id).populate(
      "employee_id",
      "name email jobTitle department"
    );

    if (!leave) {
      return res.status(404).json({
        status: false,
        message: "Leave not found",
      });
    }

    console.log("✅ Leave found:", id);

    return res.status(200).json({
      status: true,
      message: "Leave fetched successfully",
      data: leave,
    });
  } catch (error) {
    console.error("❌ Error fetching leave:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch leave",
    });
  }
};

// ✅ CREATE LEAVE
export const createLeave = async (req, res) => {
  try {
    console.log("📥 API Call: POST /api/leave/apply");
    console.log("Request Body:", req.body);

    const {
      employee_id,
      employee_name,
      leave_type,
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

    if (!leave_type || !leave_type.trim()) {
      return res.status(400).json({
        status: false,
        message: "Leave type is required",
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

    // ✅ CREATE NEW LEAVE
    const newLeave = new Leave({
      employee_id: employee_id.toString().trim(),
      employee_name: employee_name ? employee_name.toString().trim() : "",
      leave_type: leave_type.toString().toUpperCase(),
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      reason: reason ? reason.toString().trim() : "",
      number_of_days: Number(number_of_days),
      status: "PENDING",
    });

    const savedLeave = await newLeave.save();

    console.log("✅ Leave created:", savedLeave._id);

    return res.status(201).json({
      status: true,
      message: "Leave applied successfully",
      data: savedLeave,
    });
  } catch (error) {
    console.error("❌ Error creating leave:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to apply leave",
    });
  }
};

// ✅ APPROVE LEAVE
export const approveLeave = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /api/leave/:id/approve");
    console.log("Leave ID:", req.params.id);

    const { id } = req.params;
    const { approved_by } = req.body;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        status: false,
        message: "Leave not found",
      });
    }

    leave.status = "APPROVED";
    leave.approved_by = approved_by || "ADMIN";
    leave.approved_date = new Date();

    const updatedLeave = await leave.save();

    console.log("✅ Leave approved:", id);

    return res.status(200).json({
      status: true,
      message: "Leave approved successfully",
      data: updatedLeave,
    });
  } catch (error) {
    console.error("❌ Error approving leave:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to approve leave",
    });
  }
};

// ✅ REJECT LEAVE
export const rejectLeave = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /api/leave/:id/reject");
    console.log("Leave ID:", req.params.id);

    const { id } = req.params;
    const { approved_by, rejection_reason } = req.body;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        status: false,
        message: "Leave not found",
      });
    }

    leave.status = "REJECTED";
    leave.approved_by = approved_by || "ADMIN";
    leave.rejection_reason = rejection_reason || "";
    leave.approved_date = new Date();

    const updatedLeave = await leave.save();

    console.log("✅ Leave rejected:", id);

    return res.status(200).json({
      status: true,
      message: "Leave rejected successfully",
      data: updatedLeave,
    });
  } catch (error) {
    console.error("❌ Error rejecting leave:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to reject leave",
    });
  }
};

// ✅ DELETE LEAVE
export const deleteLeave = async (req, res) => {
  try {
    console.log("📥 API Call: DELETE /api/leave/:id");
    console.log("Leave ID:", req.params.id);

    const { id } = req.params;

    const leave = await Leave.findByIdAndDelete(id);

    if (!leave) {
      return res.status(404).json({
        status: false,
        message: "Leave not found",
      });
    }

    console.log("✅ Leave deleted:", id);

    return res.status(200).json({
      status: true,
      message: "Leave deleted successfully",
      data: leave,
    });
  } catch (error) {
    console.error("❌ Error deleting leave:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to delete leave",
    });
  }
};

// ✅ GET LEAVES BY EMPLOYEE
export const getLeavesByEmployee = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/leave/employee/:employeeId");
    console.log("Employee ID:", req.params.employeeId);

    const { employeeId } = req.params;

    const leaves = await Leave.find({ employee_id: employeeId })
      .populate("employee_id", "name email jobTitle department")
      .sort({ createdAt: -1 });

    console.log("✅ Found", leaves.length, "leaves for employee");

    return res.status(200).json({
      status: true,
      message: "Leaves fetched successfully",
      data: leaves,
    });
  } catch (error) {
    console.error("❌ Error fetching leaves:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch leaves",
    });
  }
};

// ✅ GET LEAVES BY STATUS
export const getLeavesByStatus = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/leave/status/:status");
    console.log("Status:", req.params.status);

    const { status } = req.params;

    const leaves = await Leave.find({ status })
      .populate("employee_id", "name email jobTitle department")
      .sort({ createdAt: -1 });

    console.log("✅ Found", leaves.length, "leaves with status:", status);

    return res.status(200).json({
      status: true,
      message: "Leaves fetched successfully",
      data: leaves,
    });
  } catch (error) {
    console.error("❌ Error fetching leaves:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch leaves",
    });
  }
};

// ✅ GET LEAVE COUNT
export const getLeaveCount = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/leave/count");

    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: "PENDING" });
    const approvedLeaves = await Leave.countDocuments({ status: "APPROVED" });
    const rejectedLeaves = await Leave.countDocuments({ status: "REJECTED" });

    console.log("✅ Leave counts fetched");

    return res.status(200).json({
      status: true,
      message: "Leave count fetched successfully",
      data: {
        total: totalLeaves,
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching leave count:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch leave count",
    });
  }
};

// ============================================
// ✅ PROFILE SECTION - NEW Leave APIs (FOR LOGGED-IN USER ONLY)
// ============================================

/**
 * ✅ APPLY LEAVE - FOR LOGGED-IN EMPLOYEE (PROFILE SECTION)
 * POST /api/leave/profile/apply/:employee_id
 * 
 * Used by: Profile section only
 * Only the logged-in employee can apply leave for themselves
 * Uses employee_id (STRING) to find employee
 */
export const applyLeaveProfile = async (req, res) => {
  try {
    console.log("📥 API Call: POST /api/leave/profile/apply/:employee_id");
    console.log("Employee ID:", req.params.employee_id);
    console.log("Request Body:", req.body);

    const { employee_id } = req.params;
    const {
      leave_type,
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

    if (!leave_type || !leave_type.trim()) {
      return res.status(400).json({
        status: false,
        message: "Leave type is required",
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

    // ✅ CREATE NEW LEAVE
    const newLeave = new Leave({
      employee_id: employee._id,  // ✅ USE MongoDB _id
      employee_name: employee.name,
      leave_type: leave_type.toString().toUpperCase(),
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      reason: reason ? reason.toString().trim() : "",
      number_of_days: Number(number_of_days),
      applied_by: "Employee",  // ✅ Mark as applied by employee (not HR)
      status: "PENDING",
    });

    const savedLeave = await newLeave.save();

    console.log("✅ Leave created successfully for employee:", employee_id);

    return res.status(201).json({
      status: true,
      message: "Leave applied successfully",
      data: savedLeave,
    });
  } catch (error) {
    console.error("❌ Error applying leave:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to apply leave",
    });
  }
};

/**
 * ✅ GET LEAVE HISTORY - FOR LOGGED-IN EMPLOYEE (PROFILE SECTION)
 * GET /api/leave/profile/history/:employee_id
 * 
 * Used by: Profile section only
 * Only the logged-in employee can view their own leave history
 * Uses employee_id (STRING) to find employee
 */
export const getLeaveHistoryProfile = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/leave/profile/history/:employee_id");
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

    // ✅ GET ALL LEAVES FOR THIS EMPLOYEE (Sort by newest first)
    const leaves = await Leave.find({ employee_id: employee._id })  // ✅ USE MongoDB _id
      .sort({ createdAt: -1 });

    console.log("✅ Leave history fetched for employee:", employee_id);

    return res.status(200).json({
      status: true,
      message: "Leave history fetched successfully",
      data: leaves || [],
    });
  } catch (error) {
    console.error("❌ Error fetching leave history:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch leave history",
    });
  }
};

// ✅ EXPORT ALL FUNCTIONS
export default {
  getAllLeaves,
  listLeaves,
  getLeaveById,
  createLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
  getLeavesByEmployee,
  getLeavesByStatus,
  getLeaveCount,
  applyLeaveProfile,           // ✅ NEW
  getLeaveHistoryProfile,      // ✅ NEW
};
