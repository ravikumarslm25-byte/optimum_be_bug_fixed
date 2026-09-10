// File: src/module/hospital/hospitalRevenue.controller.js
import HospitalRevenueShare from "./hospitalRevenue.model.js";
import Hospital from "./hospital.model.js";

// ========================================
// 1. CREATE/UPDATE HOSPITAL REVENUE SHARE CONFIG
// ========================================

export const configureHospitalRevenue = async (req, res) => {
  try {
    const {
      hospital_id,
      hospital_share_percentage,
      doctor_share_percentage,
      optimum_share_percentage,
      tds_percentage,
      advance_payment_required,
      advance_percentage,
    } = req.body;

    // Validate percentages total 100
    const total =
      hospital_share_percentage +
      doctor_share_percentage +
      optimum_share_percentage;

    if (total !== 100) {
      return res.status(400).json({
        message: `Revenue share percentages must total 100%. Current total: ${total}%`,
      });
    }

    // Get hospital name
    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Check if config already exists
    let revenueConfig = await HospitalRevenueShare.findOne({ hospital_id });

    if (revenueConfig) {
      // Update existing config
      revenueConfig.hospital_share_percentage = hospital_share_percentage;
      revenueConfig.doctor_share_percentage = doctor_share_percentage;
      revenueConfig.optimum_share_percentage = optimum_share_percentage;
      revenueConfig.tds_percentage = tds_percentage || 0;
      revenueConfig.advance_payment_required = advance_payment_required || false;
      revenueConfig.advance_percentage = advance_percentage || 0;
      await revenueConfig.save();

      return res.status(200).json({
        success: true,
        message: "Hospital revenue share configuration updated successfully",
        data: revenueConfig,
      });
    }

    // Create new config
    revenueConfig = new HospitalRevenueShare({
      hospital_id,
      hospital_name: hospital.hospital_name,
      hospital_share_percentage,
      doctor_share_percentage,
      optimum_share_percentage,
      tds_percentage: tds_percentage || 0,
      advance_payment_required: advance_payment_required || false,
      advance_percentage: advance_percentage || 0,
    });

    await revenueConfig.save();

    res.status(201).json({
      success: true,
      message: "Hospital revenue share configuration created successfully",
      data: revenueConfig,
    });
  } catch (error) {
    console.error("Error configuring hospital revenue:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// 2. GET HOSPITAL REVENUE CONFIG
// ========================================

export const getHospitalRevenueConfig = async (req, res) => {
  try {
    const { hospital_id } = req.params;

    const config = await HospitalRevenueShare.findOne({ hospital_id });

    if (!config) {
      return res.status(404).json({
        message: "Hospital revenue configuration not found. Please configure it first.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hospital revenue configuration retrieved successfully",
      data: config,
    });
  } catch (error) {
    console.error("Error fetching hospital revenue config:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// 3. GET ALL HOSPITAL REVENUE CONFIGS
// ========================================

export const getAllHospitalRevenueConfigs = async (req, res) => {
  try {
    const configs = await HospitalRevenueShare.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Hospital revenue configurations retrieved successfully",
      data: configs,
      total: configs.length,
    });
  } catch (error) {
    console.error("Error fetching hospital revenue configs:", error);
    res.status(500).json({ message: error.message });
  }
};
