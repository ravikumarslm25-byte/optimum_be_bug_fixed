import TaskModel from "./task.model.js";
import EmployeeModel from "../employee/employee.model.js";
import NotificationService from "../notifications/notify.service.js";
import NotificationModel from "../notifications/notify.model.js";

class TaskService {
  // Create a task
 static async createTask(taskData) {
  const attachments = (taskData.files || []).map((file) => ({
    fileName: file.originalname,
    filePath: file.location, // multer-s3 provides `location` property
  }));

  let assignedUsers = taskData.assigned_to;
  if (typeof assignedUsers === "string")
    assignedUsers = assignedUsers.split(",");
  if (!Array.isArray(assignedUsers)) assignedUsers = [assignedUsers];

  const { files, ...rest } = taskData;
  const task = new TaskModel({
    ...rest,
    attachments,
    assigned_to: assignedUsers,
  });

  const savedTask = await task.save();

  // ----------------- Notifications -----------------
  for (const empId of assignedUsers) {
    const employee = await EmployeeModel.findOne({ employee_id: empId });
    if (employee) {
      await NotificationService.createNotification({
        title: "New Task Assigned",
        message: `A new task "${task.task_title}" has been assigned to you.`,
        employee_id: employee.employee_id,
        createdBy: null, // or pass admin ID who created the task
      });
    }
  }

  // Optional: notify all admins
  const admins = await EmployeeModel.find({ department: "admin" });
  for (const admin of admins) {
    await NotificationService.createNotification({
      title: "Task Assigned",
      message: `Task "${task.task_title}" assigned to ${assignedUsers.join(", ")}.`,
      employee_id: admin.employee_id,
      createdBy: null,
    });
  }

  return savedTask;
}

  // Update task status
  static async updateTaskStatus(id, status) {
    return await TaskModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  // Get all tasks (for Admin)
  static async getAllTasks() {
    const tasks = await TaskModel.find().sort({ createdAt: -1 });

    // Map employee IDs to names
    const empIds = tasks.flatMap((t) => t.assigned_to);
    const employees = await EmployeeModel.find({
      employee_id: { $in: empIds },
    });
    const empMap = {};
    employees.forEach((emp) => {
      empMap[emp.employee_id] = emp.name;
    });

    return tasks.map((task) => ({
      ...task.toObject(),
      assigned_to_name: task.assigned_to
        .map((id) => empMap[id] || id)
        .join(", "),
    }));
  }

  // Get tasks for a specific employee
  static async getTasksByEmployee(employee_id) {
    const tasks = await TaskModel.find({ assigned_to: employee_id }).sort({ createdAt: -1 });

    // Map employee IDs to names
    const empIds = tasks.flatMap((t) => t.assigned_to);
    const employees = await EmployeeModel.find({
      employee_id: { $in: empIds },
    });
    const empMap = {};
    employees.forEach((emp) => {
      empMap[emp.employee_id] = emp.name;
    });

    return tasks.map((task) => ({
      ...task.toObject(),
      assigned_to_name: task.assigned_to
        .map((id) => empMap[id] || id)
        .join(", "),
    }));
  }
// No changes needed! Your existing service works perfectly:
static async addComments(taskId, commentData) {
  if (!taskId) throw new Error("Task ID is required");
  if (!commentData || !commentData.comment) throw new Error("Comment data is required");

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    { $push: { comments: commentData } },
    { new: true, runValidators: true }
  );

  if (!updatedTask) throw new Error("Task not found");

  // Enhanced notification with file info
  if (updatedTask.assigned_to && updatedTask.assigned_to.length > 0) {
    const notifications = updatedTask.assigned_to.map(personId => ({
      title: "New Task Comment",
      employee_id: personId,
      message: `New comment by ${commentData.commented_by}${commentData.fileName ? ` with attachment: ${commentData.fileName}` : ''}`,
      date: new Date(),
      read: false,
    }));

    await NotificationModel.insertMany(notifications);
  }

  return updatedTask;
}


  // Update task
  static async updateTask(_id, updateData) {
    if (updateData.assigned_to && typeof updateData.assigned_to === "string") {
      updateData.assigned_to = updateData.assigned_to.split(",");
    }
    return await TaskModel.findOneAndUpdate(
      { _id },
      { $set: updateData },
      { new: true }
    );
  }

  // Delete task
  static async deletetask(id) {
    const task = await TaskModel.findById(id);
    if (!task) throw new Error("Task not found");
    await TaskModel.findByIdAndDelete(id);
    return { message: "Task deleted successfully" };
  }
}

export default TaskService;
