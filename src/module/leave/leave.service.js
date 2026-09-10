import LeaveModel from "./leave.model.js";
import EmployeeModel from "../employee/employee.model.js";
import NotificationService from "../notifications/notify.service.js";

class LeaveService {
  // Apply for leave
  static async applyLeave(data) {
    const today = new Date();
    if (new Date(data.fromDate) < today.setHours(0, 0, 0, 0)) {
      throw new Error("Cannot apply leave for past dates");
    }

    const leave = new LeaveModel({
      ...data,
      leaveApproved: false,
      status: "PENDING",
    });

    await leave.save();

    // 🔹 Fetch employee to include name in notification
    const employee = await EmployeeModel.findOne({
      employee_id: data.employee_id,
    });
    const employeeName = employee ? employee.name : data.employee_id;

    const from = new Date(data.fromDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const to = new Date(data.toDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // 🔹 Send notification to the Reporting Person
    if (data.reportingPerson) {
      await NotificationService.createNotification({
        employee_id: data.reportingPerson, // reporting person's employee ID
        title: "Leave Request",
        message: `${employeeName} has applied for ${data.leaveType} leave from ${from} to ${to}`,
        actions: ["APPROVED", "DECLINED"],
        relatedId: leave._id.toString(),
      });
    }

    return leave;
  }

  // Approve or Decline leave
  static async respondLeave(id, action) {
    const leave = await LeaveModel.findById(id);
    if (!leave) throw new Error("Leave request not found");

    leave.status = action;
    leave.leaveApproved = action === "APPROVED";
    await leave.save();
    // ✅ Update employee leave status
    const employee = await EmployeeModel.findOne({ employee_id: leave.employee_id });
    if (employee) {
      employee.onLeave = action === "APPROVED";
      await employee.save();
    }
    // Close existing notification for the reporting person
    await NotificationService.markNotificationClosed(leave._id);

    // 🔹 Send notification to the employee
    await NotificationService.createNotification({
      employee_id: leave.employee_id,
      title: `Leave ${action}`,
      message: `Your ${
        leave.leaveType
      } leave request from ${leave.fromDate.toDateString()} to ${leave.toDate.toDateString()} has been ${action.toLowerCase()}.`,
    });

    return leave;
  }

  // Reset expired leaves automatically
  static async resetExpiredLeaves() {
    const today = new Date();
    const expiredLeaves = await LeaveModel.find({
      leaveApproved: true,
      toDate: { $lt: today },
      status: "APPROVED",
    });

    for (const leave of expiredLeaves) {
      leave.leaveApproved = false;
      leave.status = "EXPIRED";
      await leave.save();
    }
  }

  // Get leaves by reporting person
  static async getLeavesByReportingPerson(reportingPerson) {
    return await LeaveModel.find({ reportingPerson });
  }

  // Get leaves by employee
  static async getLeavesByEmployee(employee_id) {
    return await LeaveModel.find({ employee_id });
  }
}

export default LeaveService;
