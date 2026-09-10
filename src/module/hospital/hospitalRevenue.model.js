// File: src/module/hospital/hospitalRevenue.model.js
import mongoose from "mongoose";

const hospitalRevenueShareSchema = new mongoose.Schema(
  {
    hospital_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      unique: true,
    },
    hospital_name: String,
    
    // Revenue Share Percentages
    hospital_share_percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      description: "Hospital's share percentage (e.g., 40%)",
    },
    
    doctor_share_percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      description: "Doctor's share percentage (e.g., 40%)",
    },
    
    optimum_share_percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      description: "Optimum's share percentage (e.g., 20%)",
    },
    
    // Additional configurations
    tds_percentage: {
      type: Number,
      default: 0,
      description: "TDS (Tax Deducted at Source) percentage",
    },
    
    advance_payment_required: Boolean,
    advance_percentage: Number,
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Validation: Total should be 100%
hospitalRevenueShareSchema.pre("save", function (next) {
  const total =
    this.hospital_share_percentage +
    this.doctor_share_percentage +
    this.optimum_share_percentage;
  
  if (total !== 100) {
    throw new Error(`Revenue share percentages must total 100%. Current total: ${total}%`);
  }
  next();
});

export default mongoose.model(
  "HospitalRevenueShare",
  hospitalRevenueShareSchema
);
