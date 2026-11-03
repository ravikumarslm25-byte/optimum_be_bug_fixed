import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import {
  scheduleCronJobs,
  scheduleCronWFH,
  scheduleCronLeaveStatus,
} from "./src/config/cron.js";

import connectDB from "./src/config/db.js";
import roleRoute from "./src/module/role/role.route.js";
import morgan from "morgan";
import logger from "./src/config/logger.js";
import employeeRoute from "./src/module/employee/employee.route.js";
import appointmentRoute from "./src/module/appointment/appointment.route.js";
import taskRoute from "./src/module/task/task.route.js";
import campaignRoute from "./src/module/leads/campaign/campaign.route.js";
import leadRoute from "./src/module/leads/lead/lead.route.js";
import doctorRoute from "./src/module/doctor/doctor.route.js";
import hospitalRoute from "./src/module/hospital/hospital.route.js";
import notificationRoute from "./src/module/notifications/notify.route.js";
import WFHRoute from "./src/module/wfh/wfh.route.js";
import LeaveRoute from "./src/module/leave/leave.route.js";
import categoryRoute from "./src/module/category/category.route.js";
import departmentRoute from "./src/module/department/department.route.js";
import masterroleRoute from "./src/module/role master/rolem.route.js";
import financeRoute from "./src/module/finance/finance.route.js";
import hospitalRevenueRoute from "./src/module/hospital/hospitalRevenue.route.js";
import doctorRevenueRoute from "./src/module/doctor/doctorRevenue.route.js";
import attendanceRoute from "./src/module/attendance/attendance.route.js";
import payrollRoute from "./src/module/payroll/payroll.route.js";
import reportRoute from "./src/module/reports/report.route.js";
import idcodeRoute from "./src/module/idcode/idcode.route.js";

// ✅ WEBSITE ROUTES (New - Phase 1)
import websiteFormsRoute from "./src/module/website/forms/forms.route.js";
import websiteBlogRoute from "./src/module/website/blog/blog.route.js";
import websiteMediaRoute from "./src/module/website/media/media.route.js";
import websiteCareersRoute from "./src/module/website/careers/careers.route.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();
// Behind the nginx reverse proxy that terminates SSL, trust the first proxy so
// req.protocol/req.secure/req.ip reflect the real client (needed for correct
// Secure-cookie behaviour and accurate client IPs). Safe: no existing code reads
// these request properties, so this changes no current behaviour.
app.set("trust proxy", 1);
connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

scheduleCronJobs();
scheduleCronWFH();
scheduleCronLeaveStatus();

//middleware
app.use(cookieParser());
// ⚡ gzip-compress responses — large JSON lists (leads, etc.) shrink ~10x,
// which is the biggest win for load time as the data grows.
app.use(compression());
app.use(express.json({ limit: '100mb' })); // ✅ Increased for file uploads
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true })); // ✅ Increased
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Add Morgan Middleware for Logging
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

logger.info("Server started successfully");

// ============================================
// ROUTES - CLEAN & NO DUPLICATES
// ============================================

app.use("/role", roleRoute);
app.use("/rolemaster", masterroleRoute);
app.use("/category", categoryRoute);  
app.use("/department", departmentRoute);
app.use("/employee", employeeRoute);
app.use("/appointment", appointmentRoute);
app.use("/task", taskRoute);
app.use("/campaign", campaignRoute);
app.use("/lead", leadRoute);
app.use("/idcode", idcodeRoute);
app.use("/doctor", doctorRoute);
app.use("/hospital", hospitalRoute);
app.use("/notify", notificationRoute);
app.use("/wfh", WFHRoute);
app.use("/leave", LeaveRoute);
app.use("/finance", financeRoute);
app.use("/hospital/revenue", hospitalRevenueRoute);
app.use("/doctor/revenue", doctorRevenueRoute);
app.use("/attendance", attendanceRoute);
app.use("/payroll", payrollRoute);
app.use("/reports", reportRoute);

// ============================================
// ✅ WEBSITE ROUTES (New - Phase 1 Integration)
// ============================================

app.use("/website/forms", websiteFormsRoute);
app.use("/website/blog", websiteBlogRoute);
app.use("/website/media", websiteMediaRoute);
app.use("/website/careers", websiteCareersRoute);

// ============================================
// HOME ROUTE
// ============================================

app.get("/", (req, res) => {
  res.send(`Welcome to Optimum Backend`);
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`✓ Server is running in port ${PORT}`);
});
