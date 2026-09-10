// File: src/module/doctor/doctorRevenue.model.js
import mongoose from "mongoose";

const doctorRevenueShareSchema = new mongoose.Schema(
  {
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },
    doctor_name: String,
    
    // Revenue Share Configuration
    doctor_share_percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      description: "Doctor's share percentage (e.g., 40%)",
    },
    
    tds_percentage: {
      type: Number,
      default: 5,
      description: "TDS deduction for doctor",
    },
    
    net_share_percentage: {
      type: Number,
      description: "After TDS deduction (calculated)",
    },
    
    bank_details: {
      bank_name: String,
      account_number: String,
      ifsc_code: String,
      account_holder_name: String,
    },
    
    payment_mode: {
      type: String,
      enum: ["BANK_TRANSFER", "CHEQUE", "CASH"],
      default: "BANK_TRANSFER",
    },
    
    is_active: {
      type: Boolean,
      default: true,
    },
    
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

// Calculate net share after TDS
doctorRevenueShareSchema.pre("save", function (next) {
  this.net_share_percentage =
    this.doctor_share_percentage - (this.doctor_share_percentage * this.tds_percentage) / 100;
  next();
});

export default mongoose.model("DoctorRevenueShare", doctorRevenueShareSchema);
