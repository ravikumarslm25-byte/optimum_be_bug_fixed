// File: src/module/finance/doctorPayout.model.js
import mongoose from "mongoose";

const doctorPayoutSchema = new mongoose.Schema(
  {
    payout_number: {
      type: String,
      unique: true,
      required: true,
      description: "Format: DP-YYYYMM-0001",
    },
    
    payout_date: {
      type: Date,
      required: true,
    },
    
    // Reference to Invoice(s)
    invoice_ids: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    }],
    
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    doctor_name: String,
    
    // Payout Details
    gross_amount: {
      type: Number,
      required: true,
      description: "Total before TDS",
    },
    
    tds_amount: {
      type: Number,
      required: true,
      description: "TDS deducted",
    },
    
    net_amount: {
      type: Number,
      required: true,
      description: "Net amount after TDS",
    },
    
    payout_mode: {
      type: String,
      enum: ["BANK_TRANSFER", "CHEQUE", "CASH"],
      default: "BANK_TRANSFER",
    },
    
    // Payout Status
    status: {
      type: String,
      enum: ["PENDING", "PROCESSED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    
    // Bank Details
    bank_name: String,
    account_number: String,
    ifsc_code: String,
    
    // Documentation
    bank_slip: String,
    cheque_number: String,
    notes: String,
    
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    processedBy: {
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

export default mongoose.model("DoctorPayout", doctorPayoutSchema);
