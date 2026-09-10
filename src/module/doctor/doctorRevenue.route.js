// File: src/module/doctor/doctorRevenue.route.js
import { Router } from "express";
import {
  configureDoctorRevenue,
  getDoctorRevenueConfig,
  getAllDoctorRevenueConfigs,
} from "./doctorRevenue.controller.js";

const doctorRevenueRoute = Router();

// Configure doctor revenue share (POST for create/update)
doctorRevenueRoute.post(
  "/configure",
  configureDoctorRevenue
);

// Get doctor revenue config by ID (GET /config/:doctor_id) - SPECIFIC ROUTE FIRST
doctorRevenueRoute.get(
  "/config/:doctor_id",
  getDoctorRevenueConfig
);

// Get all doctor revenue configs (GET /) - GENERIC ROUTE LAST
doctorRevenueRoute.get(
  "/",
  getAllDoctorRevenueConfigs
);

export default doctorRevenueRoute;
