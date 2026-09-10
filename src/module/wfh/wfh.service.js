import WFHModel from "./wfh.model.js";
import EmployeeModel from "../employee/employee.model.js";
import NotificationService from "../notifications/notify.service.js"; // your notification logic

class WFHService {
  // Apply for WFH
  static async applyWFH(data) {
    const today = new Date();
    if (new Date(data.fromDate) < today) {
      throw new Error("Cannot apply WFH for past dates");
    }
    const wfhRequest = new WFHModel({
      ...data,
      wfhApproved: false,
      status: "PENDING",
    });
    await wfhRequest.save();

    // ✅ Fetch employee name from Employee collection
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

    // Send notification to reporting person
    await NotificationService.createNotification({
      employee_id: data.reportingPerson,
      title: "WFH Request",
      message: `${employeeName} has applied for WFH from ${from} to ${to}`,
      actions: ["APPROVED", "DECLINED"],
      relatedId: wfhRequest._id.toString(),
    });

    return wfhRequest;
  }

  // Approve or Decline WFH
  static async respondWFH(id, action) {
    const request = await WFHModel.findById(id);
    if (!request) throw new Error("WFH request not found");

    request.status = action;
    request.wfhApproved = action === "APPROVED";
    await request.save();
    const today = new Date();
    // Update employee document if approved
    if(action === "APPROVED" && new Date(request.fromDate) <= today) {
      await EmployeeModel.findOneAndUpdate(
        { employee_id: request.employee_id },
        { wfhApproved: true }
      );
    }
    await NotificationService.markNotificationClosed(request._id);
    // Optional: Notify employee
    await NotificationService.createNotification({
      employee_id: request.employee_id,
      title: `WFH ${action}`,
      message: `Your WFH request from ${request.fromDate.toDateString()} to ${request.toDate.toDateString()} has been ${action.toLowerCase()}.`,
    });

    return request;
  }

  static async resetExpiredWFH() {
    const today = new Date();
    const expiredWFHs = await WFHModel.find({
      wfhApproved: true,
      toDate: { $lt: today },
      status: "APPROVED",
    });

    for (const wfh of expiredWFHs) {
      await EmployeeModel.findOneAndUpdate(
        { employee_id: wfh.employee_id },
        { wfhApproved: false }
      );
      wfh.wfhApproved = false;
      await wfh.save();
    }
  }

  // Get all WFH requests for reporting person
  static async getWFHByReportingPerson(reportingPersonId) {
    return await WFHModel.find({ reportingPerson: reportingPersonId });
  }

  // Get all WFH requests by employee
  static async getWFHByEmployee(employee_id) {
    return await WFHModel.find({ employee_id: employee_id });
  }
}

export default WFHService;
