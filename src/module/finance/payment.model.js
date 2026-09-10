// File: src/module/finance/payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    payment_number: {
      type: String,
      unique: true,
      required: true,
      description: "Format: PAY-YYYYMM-0001",
    },
    
    payment_date: {
      type: Date,
      required: true,
    },
    
    // Invoice Reference
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    
    invoice_number: String,
    hospital_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    hospital_name: String,
    
    // Payment Details
    amount_received: {
      type: Number,
      required: true,
      description: "Amount hospital paid to Optimum",
    },
    
    payment_mode: {
      type: String,
      enum: ["CASH", "CHEQUE", "BANK_TRANSFER", "NEFT", "RTGS"],
      required: true,
    },
    
    reference_number: {
      type: String,
      description: "Cheque number, Bank transfer reference, etc.",
    },
    
    payment_type: {
      type: String,
      enum: ["FULL", "PARTIAL"],
      default: "FULL",
    },
    
    // Payment Status
    status: {
      type: String,
      enum: ["PENDING", "RECEIVED", "CLEARED", "BOUNCED"],
      default: "RECEIVED",
    },
    
    // For Partial Payments
    remaining_amount: Number,
    
    // Documentation
    cheque_image: String,
    bank_slip: String,
    notes: String,
    
    recordedBy: {
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

export default mongoose.model("Payment", paymentSchema);
