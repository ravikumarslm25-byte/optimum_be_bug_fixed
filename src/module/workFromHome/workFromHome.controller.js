// File: src/module/workFromHome/workFromHome.controller.js
import WorkFromHome from "./workFromHome.model.js";
import Employee from "../employee/employee.model.js";

export const applyWFH = async (req, res) => {
  try {
    const { employee_id, date, reason, start_time, end_time, work_description, document } = req.body;

    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const currentDate = new Date();
    const yearMonth = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    const lastWFH = await WorkFromHome.findOne({
      wfh_id: new RegExp(`^WFH-${yearMonth}`),
    }).sort({ wfh_id: -1 });

    const wfhCount = lastWFH ? parseInt(lastWFH.wfh_id.split("-")[2]) + 1 : 1;
    const wfhId = `WFH-${yearMonth}-${String(wfhCount).padStart(4, "0")}`;

    const wfh = new WorkFromHome({
      wfh_id: wfhId,
      employee_id,
      employee_name: employee.employee_name,
      date: new Date(date),
      reason,
      start_time,
      end_time,
      work_description,
      document,
    });

    await wfh.save();

    res.status(201).json({
      success: true,
      message: "Work from home request submitted",
      data: wfh,
    });
  } catch (error) {
    console.error("Error applying WFH:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllWFH = async (req, res) => {
  try {
    const { status, employee_id } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (employee_id) filter.employee_id = employee_id;

    const wfh = await WorkFromHome.find(filter)
      .populate("employee_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: wfh,
      total: wfh.length,
    });
  } catch (error) {
    console.error("Error fetching WFH:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeWFH = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const wfh = await WorkFromHome.find({ employee_id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: wfh,
      total: wfh.length,
    });
  } catch (error) {
    console.error("Error fetching employee WFH:", error);
    res.status(500).json({ message: error.message });
  }
};

export const approveWFH = async (req, res) => {
  try {
    const { wfh_id } = req.params;
    const { approved_by, approved_by_name, approval_comments } = req.body;

    const wfh = await WorkFromHome.findByIdAndUpdate(
      wfh_id,
      {
        status: "APPROVED",
        approved_by,
        approved_by_name,
        approval_comments,
        approval_date: new Date(),
      },
      { new: true }
    );

    if (!wfh) {
      return res.status(404).json({ message: "WFH request not found" });
    }

    // ✅ UPDATE EMPLOYEE'S wfhApproved FIELD TO TRUE
    if (wfh.employee_id) {
      console.log("📝 Updating employee wfhApproved field...");
      console.log("Employee ID:", wfh.employee_id);
      
      const updatedEmployee = await Employee.findByIdAndUpdate(
        wfh.employee_id,
        { wfhApproved: true },
        { new: true }
      );

      console.log("✅ Employee wfhApproved updated to true");
      console.log("   Employee ID:", updatedEmployee.employee_id);
    }

    res.status(200).json({
      success: true,
      message: "WFH request approved",
      data: wfh,
    });
  } catch (error) {
    console.error("Error approving WFH:", error);
    res.status(500).json({ message: error.message });
  }
};

export const rejectWFH = async (req, res) => {
  try {
    const { wfh_id } = req.params;
    const { approved_by, approved_by_name, approval_comments } = req.body;

    const wfh = await WorkFromHome.findByIdAndUpdate(
      wfh_id,
      {
        status: "REJECTED",
        approved_by,
        approved_by_name,
        approval_comments,
        approval_date: new Date(),
      },
      { new: true }
    );

    if (!wfh) {
      return res.status(404).json({ message: "WFH request not found" });
    }

    res.status(200).json({
      success: true,
      message: "WFH request rejected",
      data: wfh,
    });
  } catch (error) {
    console.error("Error rejecting WFH:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteWFH = async (req, res) => {
  try {
    const { wfh_id } = req.params;

    const wfh = await WorkFromHome.findByIdAndDelete(wfh_id);

    if (!wfh) {
      return res.status(404).json({ message: "WFH request not found" });
    }

    res.status(200).json({
      success: true,
      message: "WFH request deleted",
    });
  } catch (error) {
    console.error("Error deleting WFH:", error);
    res.status(500).json({ message: error.message });
  }
};
