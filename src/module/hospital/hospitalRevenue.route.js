// File: src/module/hospital/hospitalRevenue.route.js
import { Router } from "express";
import {
  configureHospitalRevenue,
  getHospitalRevenueConfig,
  getAllHospitalRevenueConfigs,
} from "./hospitalRevenue.controller.js";

const hospitalRevenueRoute = Router();

// Configure hospital revenue share (POST for create/update)
hospitalRevenueRoute.post(
  "/configure",
  configureHospitalRevenue
);

// Get hospital revenue config by ID (GET /config/:hospital_id) - SPECIFIC ROUTE FIRST
hospitalRevenueRoute.get(
  "/config/:hospital_id",
  getHospitalRevenueConfig
);

// Get all hospital revenue configs (GET /) - GENERIC ROUTE LAST
hospitalRevenueRoute.get(
  "/",
  getAllHospitalRevenueConfigs
);

export default hospitalRevenueRoute;
