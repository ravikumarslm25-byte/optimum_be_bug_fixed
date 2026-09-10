// cronJobs.js
import cron from "node-cron";
import TaskModel from "../module/task/task.model.js";
import WFHModel from "../module/wfh/wfh.model.js";
import EmployeeModel from "../module/employee/employee.model.js";
import LeaveModel from "../module/leave/leave.model.js";

export const scheduleCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log(new Date(), "Cron job started");
      const today = new Date();
      const result = await TaskModel.updateMany(
        { due_date: { $lt: today }, status: "doing" },
        { $set: { status: "incomplete" } }
      );
      console.log("Updated tasks count:", result.modifiedCount);
      console.log("✅ Overdue tasks updated to 'incomplete'");
    } catch (err) {
      console.error("Cron job error:", err);
    }
  });
};

export const scheduleCronWFH = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // normalize to start of day

      // ✅ 1. Activate WFH when today is within approved range and not yet active
      const toActivate = await WFHModel.find({
        fromDate: { $lte: today },
        toDate: { $gte: today },
        status: "APPROVED",
        wfhApproved: false, // not yet active
      });

      for (const wfh of toActivate) {
        // Update WFH record
        wfh.wfhApproved = true;
        await wfh.save();

        // Update Employee record
        await EmployeeModel.findOneAndUpdate(
          { employee_id: wfh.employee_id },
          { wfhApproved: true }
        );
      }

      // ❌ 2. Deactivate (expire) WFH where end date has passed
      const toDeactivate = await WFHModel.find({
        toDate: { $lt: today },
        status: "APPROVED",
        wfhApproved: true, // currently active
      });

      for (const wfh of toDeactivate) {
        // Update WFH record
        wfh.wfhApproved = false;
        await wfh.save();

        // Update Employee record
        await EmployeeModel.findOneAndUpdate(
          { employee_id: wfh.employee_id },
          { wfhApproved: false }
        );
      }

      console.log(
        `✅ WFH activated: ${toActivate.length}, deactivated: ${toDeactivate.length}`
      );
    } catch (err) {
      console.error("❌ Error in scheduleCronWFH:", err.message);
    }
  });
};

export const scheduleCronLeaveStatus = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // 1️⃣ Set leaveApproved = true for employees whose leave starts today or ongoing
      const leavesStartingToday = await LeaveModel.find({
        fromDate: { $lte: new Date(today) },
        toDate: { $gte: new Date(today) },
        status: "Approved",
      });

      for (const leave of leavesStartingToday) {
        await EmployeeModel.findByIdAndUpdate(
          leave.employee_id,
          { leaveApproved: true },
          { new: true }
        );
      }

      // 2️⃣ Set leaveApproved = false for employees whose leave ended before today
      const leavesEndedYesterday = await LeaveModel.find({
        toDate: { $lt: new Date(today) },
        status: "Approved",
      });

      for (const leave of leavesEndedYesterday) {
        await EmployeeModel.findByIdAndUpdate(
          leave.employee_id,
          { leaveApproved: false },
          { new: true }
        );
      }

      console.log("✅ Daily leave status sync completed");
    } catch (error) {
      console.error("❌ Error in leave status cron:", error);
    }
  });
};
