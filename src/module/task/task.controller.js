
import TaskService from "./task.service.js";

export const createTask = async (req, res) => {
  try {
    const files = req.files || [];
    const data = { ...req.body, files };
    const task = await TaskService.createTask(data);
    res.status(201).json({ status: true, message: "Task created", data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
};



export const addComments = async (req, res) => {
  try {
    const taskId = req.params._id;
    
    // Prepare comment data
    const commentData = {
      comment: req.body.comment,
      taskId: taskId,
      commented_by: req.body.commented_by,
      date: new Date(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add S3 file info if file uploaded
    if (req.file) {
      commentData.filePath = req.file.location; // ✅ S3 full URL
      commentData.fileName = req.file.originalname;
      commentData.fileSize = req.file.size;
      commentData.s3Key = req.file.key; // ✅ S3 key for future reference
    }

    const updatedTask = await TaskService.addComments(taskId, commentData);

    res.status(201).json({
      status: true,
      message: "Comment added successfully",
      data: {
        task: updatedTask,
        comment: commentData
      }
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message || "Failed to add comment"
    });
  }
};



// task.controller.js
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "completed" or "doing"

    const updatedTask = await TaskService.updateTaskStatus(id, status);
    if (!updatedTask) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    res.status(200).json({ status: true, message: "Task status updated", data: updatedTask });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const { department, employee_id } = req.query; // coming from frontend query params

    let data;

    if (department === "admin") {
      // 👨‍💼 Admin sees all tasks
      data = await TaskService.getAllTasks();
    } else {
      // 👷 Employee sees only tasks assigned to them
      data = await TaskService.getTasksByEmployee(employee_id);
    }

    res.status(200).json({ status: true, data });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};




export const updateTask = async (req, res) => {
  try {
    const data = await TaskService.updateTask(req.params._id, req.body);
    if (!data) return res.status(404).json({ status: false, message: "Task not found" });
    res.status(200).json({ status: true, message: "Task updated", data });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const deletetask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TaskService.deletetask(id);
    res.status(200).json(result);
  } catch (err) {
    console.error("Delete task error:", err);
    res
      .status(400)
      .json({ message: err.message || "Failed to delete task" });
  }
};