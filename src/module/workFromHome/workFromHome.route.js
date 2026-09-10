// File: src/module/workFromHome/workFromHome.route.js
import { Router } from "express";
import {
  applyWFH,
  getAllWFH,
  getEmployeeWFH,
  approveWFH,
  rejectWFH,
  deleteWFH,
} from "./workFromHome.controller.js";

const workFromHomeRoute = Router();

workFromHomeRoute.post("/apply", applyWFH);
workFromHomeRoute.get("/list", getAllWFH);
workFromHomeRoute.get("/employee/:employee_id", getEmployeeWFH);
workFromHomeRoute.put("/:wfh_id/approve", approveWFH);
workFromHomeRoute.put("/:wfh_id/reject", rejectWFH);
workFromHomeRoute.delete("/:wfh_id", deleteWFH);

export default workFromHomeRoute;
