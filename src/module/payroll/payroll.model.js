// ====================================
// FILE: src/module/payroll/payroll.model.js
// POLICY-BASED PAYROLL MODEL
// 30-day basis · Late fee · Half-day · Paid-leave quota · No PF/ESI
// ====================================

import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    // ✅ EMPLOYEE REFERENCE
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    employee_name: {
      type: String,
      required: true,
      trim: true,
    },
    employee_id_str: {
      type: String,
      trim: true,
      sparse: true,
    },

    // ✅ PERIOD
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },

    // ✅ SALARY BASIS (Policy 1: 30-day basis)
    monthly_gross: { type: Number, required: true, default: 0 }, // CTC / 12
    per_day_salary: { type: Number, default: 0 }, // monthly_gross / 30
    days_in_month: { type: Number, default: 30 },

    // ✅ ATTENDANCE BREAKDOWN (aggregated from Attendance + Leave)
    days_present: { type: Number, default: 0 }, // full present days
    half_days: { type: Number, default: 0 }, // check-in after 12:00 PM
    late_days: { type: Number, default: 0 }, // check-in after 9:45 AM
    days_absent: { type: Number, default: 0 }, // marked ABSENT or NO record on a working day
    wfh_days: { type: Number, default: 0 },
    weekly_off_days: { type: Number, default: 0 }, // paid, never LOP
    holiday_days: { type: Number, default: 0 }, // paid, never LOP
    pre_joining_days: { type: Number, default: 0 }, // pro-rata, not LOP
    future_days: { type: Number, default: 0 }, // month not finished yet
    paid_leaves_used: { type: Number, default: 0 }, // CL/SL + absences covered by quota
    absent_covered_by_leave: { type: Number, default: 0 }, // absences absorbed by CL balance
    unpaid_leave_days: { type: Number, default: 0 }, // CL/SL beyond quota (LOP)

    // ✅ DERIVED DAYS
    payable_days: { type: Number, default: 0 }, // days actually paid
    lop_days: { type: Number, default: 0 }, // loss-of-pay days (incl. 0.5 per half day)

    // ✅ EARNINGS
    earned_salary: { type: Number, default: 0 }, // monthly_gross - (per_day * lop_days)
    incentives: { type: Number, default: 0 }, // Policy 4 (manual)
    reimbursement: { type: Number, default: 0 }, // Policy 6 (manual)

    // ✅ DEDUCTIONS (Policy 9: NO PF / NO ESI)
    late_deduction: { type: Number, default: 0 }, // late_days * 50
    salary_advance: { type: Number, default: 0 }, // Policy 5 (manual)
    lop_amount: { type: Number, default: 0 }, // informational: per_day * lop_days
    pre_joining_amount: { type: Number, default: 0 }, // pro-rata reduction for new joiners
    total_deductions: { type: Number, default: 0 }, // late_deduction + salary_advance

    // ✅ NET (kept as gross_salary/net_salary for statistics compatibility)
    gross_salary: { type: Number, required: true, default: 0 }, // = monthly_gross
    net_salary: { type: Number, required: true, default: 0 },

    // ✅ PAID-LEAVE LEDGER SNAPSHOT (for the payslip)
    paid_leave_opening: { type: Number, default: 0 }, // carried in
    paid_leave_accrued: { type: Number, default: 0 }, // +2 this month
    paid_leave_closing: { type: Number, default: 0 }, // carried forward

    // ✅ STATUS
    status: {
      type: String,
      enum: ["GENERATED", "APPROVED", "PAID", "PENDING"],
      default: "GENERATED",
      index: true,
    },

    // ✅ PAYMENT
    payment_date: { type: Date, default: null, sparse: true },
    payment_method: {
      type: String,
      enum: ["BANK_TRANSFER", "CASH", "CHECK"],
      default: "BANK_TRANSFER",
    },

    notes: { type: String, default: "" },
    generated_by: { type: String, default: "HR" },
    approved_by: { type: String, default: null, sparse: true },
    approved_date: { type: Date, default: null, sparse: true },
  },
  { timestamps: true }
);

payrollSchema.on("index", function (err) {
  if (err) console.error("Index error (non-fatal):", err.message);
});

// Unique per employee per month
payrollSchema.index(
  { employee_id: 1, month: 1, year: 1 },
  { unique: true, sparse: true }
);
payrollSchema.index({ status: 1 });
payrollSchema.index({ year: 1, month: 1 });
payrollSchema.index({ createdAt: -1 });

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;
