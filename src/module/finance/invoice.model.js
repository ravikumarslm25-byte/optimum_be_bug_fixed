// File: src/module/finance/invoice.model.js
import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      unique: true,
      required: true,
      description: "Format: INV-YYYYMM-0001",
    },
    
    invoice_date: {
      type: Date,
      default: Date.now,
    },
    
    // Reference to Appointment
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    
    appointment_type: {
      type: String,
      enum: ["OPD", "IPD"],
      required: true,
    },
    
    // Patient & Hospital Info
    patient_name: String,
    patient_id: String,
    hospital_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    hospital_name: String,
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    doctor_name: String,
    
    // Financial Details
    treatment: String,
    total_amount: {
      type: Number,
      required: true,
      description: "Total bill amount from hospital",
    },
    
    // Revenue Share Breakdown
    hospital_share: {
      percentage: Number,
      amount: Number,
    },
    
    doctor_share: {
      percentage: Number,
      gross_amount: Number, // Before TDS
      tds_percentage: Number,
      tds_amount: Number,
      net_amount: Number, // After TDS
    },
    
    optimum_share: {
      percentage: Number,
      amount: Number,
    },
    
    // Invoice Status
    status: {
      type: String,
      enum: ["DRAFT", "ISSUED", "SENT", "RECEIVED"],
      default: "ISSUED",
    },
    
    // Description/Notes
    description: String,
    notes: String,
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

// Create compound index for unique invoice per month
invoiceSchema.index({ hospital_id: 1, invoice_date: 1 });

export default mongoose.model("Invoice", invoiceSchema);
