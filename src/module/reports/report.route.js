// ====================================
// FILE: src/module/reports/report.route.js
// REPORTS ROUTES
// ====================================

import express from "express";
import {
  getCampaignReport,
  getLeadsReport,
  getHRReport,
  getHospitalReport,
  getDoctorReport,
  getAppointmentsReport,
} from "./report.controller.js";

const router = express.Router();

// ✅ CAMPAIGN REPORT
router.get("/campaign", getCampaignReport);

// ✅ LEADS REPORT
router.get("/leads", getLeadsReport);

// ✅ APPOINTMENTS REPORT (OPD / IPD)
router.get("/appointments", getAppointmentsReport);

// ✅ HR REPORT
router.get("/hr", getHRReport);

// ✅ HOSPITAL REPORT
router.get("/hospital", getHospitalReport);

// ✅ DOCTOR REPORT
router.get("/doctor", getDoctorReport);

export default router;
