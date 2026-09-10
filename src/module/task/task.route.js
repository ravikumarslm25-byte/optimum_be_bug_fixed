import { Router } from "express";
import {
  addComments,
  createTask,
  deletetask,
  getAllTasks,
  updateTask,
  updateTaskStatus,
} from "./task.controller.js";
import { upload, uploadTaskCommentFile } from "../../config/multer.js";

const taskRoute = Router();

taskRoute.post("/add", upload.array("attachments", 5), createTask);
taskRoute.post("/addcomment/:_id", uploadTaskCommentFile, addComments);
taskRoute.patch("/updatetask/:id/status", updateTaskStatus);

taskRoute.get("/getalltasks", getAllTasks);


taskRoute.put("/updatetasks/:_id", updateTask);
taskRoute.delete("/deletetask/:id", deletetask);

export default taskRoute;
