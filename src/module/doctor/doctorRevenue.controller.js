// File: src/module/doctor/doctorRevenue.controller.js
import DoctorRevenueShare from "./doctorRevenue.model.js";
import Doctor from "./doctor.model.js";

// ========================================
// 1. CREATE/UPDATE DOCTOR REVENUE SHARE CONFIG
// ========================================

export const configureDoctorRevenue = async (req, res) => {
  try {
    const {
      doctor_id,
      doctor_share_percentage,
      tds_percentage,
      bank_name,
      account_number,
      ifsc_code,
      account_holder_name,
      payment_mode,
    } = req.body;

    // Get doctor name
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Validate percentages
    if (doctor_share_percentage < 0 || doctor_share_percentage > 100) {
      return res.status(400).json({
        message: "Doctor share percentage must be between 0 and 100",
      });
    }

    if (tds_percentage < 0 || tds_percentage > 100) {
      return res.status(400).json({
        message: "TDS percentage must be between 0 and 100",
      });
    }

    // Check if config already exists
    let revenueConfig = await DoctorRevenueShare.findOne({ doctor_id });

    if (revenueConfig) {
      // Update existing config
      revenueConfig.doctor_share_percentage = doctor_share_percentage;
      revenueConfig.tds_percentage = tds_percentage;
      revenueConfig.bank_details = {
        bank_name,
        account_number,
        ifsc_code,
        account_holder_name,
      };
      revenueConfig.payment_mode = payment_mode || "BANK_TRANSFER";
      await revenueConfig.save();

      return res.status(200).json({
        success: true,
        message: "Doctor revenue share configuration updated successfully",
        data: revenueConfig,
      });
    }

    // Create new config
    revenueConfig = new DoctorRevenueShare({
      doctor_id,
      doctor_name: doctor.doctor_name,
      doctor_share_percentage,
      tds_percentage,
      bank_details: {
        bank_name,
        account_number,
        ifsc_code,
        account_holder_name,
      },
      payment_mode: payment_mode || "BANK_TRANSFER",
    });

    await revenueConfig.save();

    res.status(201).json({
      success: true,
      message: "Doctor revenue share configuration created successfully",
      data: revenueConfig,
    });
  } catch (error) {
    console.error("Error configuring doctor revenue:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// 2. GET DOCTOR REVENUE CONFIG
// ========================================

export const getDoctorRevenueConfig = async (req, res) => {
  try {
    const { doctor_id } = req.params;

    const config = await DoctorRevenueShare.findOne({ doctor_id });

    if (!config) {
      return res.status(404).json({
        message: "Doctor revenue configuration not found. Please configure it first.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor revenue configuration retrieved successfully",
      data: config,
    });
  } catch (error) {
    console.error("Error fetching doctor revenue config:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// 3. GET ALL DOCTOR REVENUE CONFIGS
// ========================================

export const getAllDoctorRevenueConfigs = async (req, res) => {
  try {
    const configs = await DoctorRevenueShare.find()
      .populate("doctor_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Doctor revenue configurations retrieved successfully",
      data: configs,
      total: configs.length,
    });
  } catch (error) {
    console.error("Error fetching doctor revenue configs:", error);
    res.status(500).json({ message: error.message });
  }
};
