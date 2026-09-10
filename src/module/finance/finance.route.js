// File: src/module/finance/finance.route.js
import { Router } from "express";
import {
  createInvoice,
  calculateRevenueBreakup,
  getAllInvoices,
  getInvoiceDetails,
  recordPayment,
  getPayments,
  createDoctorPayout,
  getDoctorPayouts,
  updatePayoutStatus,
  getFinanceSummary,
} from "./finance.controller.js";

const financeRoute = Router();

// ========================================
// INVOICE ROUTES
// ========================================

// Calculate revenue breakup (before creating invoice)
financeRoute.post("/invoice/calculate-breakup", calculateRevenueBreakup);

// Create invoice (after appointment completion)
financeRoute.post("/invoice/create", createInvoice);

// Get all invoices with filters
financeRoute.get("/invoice/list", getAllInvoices);

// Get invoice details with payment history
financeRoute.get("/invoice/:invoice_id", getInvoiceDetails);

// ========================================
// PAYMENT ROUTES
// ========================================

// Record payment from hospital
financeRoute.post("/payment/record", recordPayment);

// Get payments with filters
financeRoute.get("/payment/list", getPayments);

// ========================================
// DOCTOR PAYOUT ROUTES
// ========================================

// Create doctor payout
financeRoute.post("/payout/create", createDoctorPayout);

// Get doctor payouts
financeRoute.get("/payout/list", getDoctorPayouts);

// Update payout status
financeRoute.put("/payout/:payout_id/status", updatePayoutStatus);

// ========================================
// DASHBOARD & REPORTS
// ========================================

// Get finance summary/dashboard
financeRoute.get("/summary", getFinanceSummary);

export default financeRoute;
