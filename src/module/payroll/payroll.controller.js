// ====================================
// FILE: src/module/payroll/payroll.controller.js
// POLICY-BASED PAYROLL CONTROLLER
// 30-day basis · Late fee · Half-day · Paid-leave quota · No PF/ESI
// ====================================

import Payroll from "./payroll.model.js";
import Employee from "../employee/employee.model.js";
import AttendanceModel from "../attendance/attendance.model.js";
import Leave from "../leave/leave.model.js";
import {
  ATTENDANCE_POLICY,
  isNonWorkingDay,
  toISTDateKey,
} from "../../config/attendancePolicy.js";

const DAYS_IN_MONTH = ATTENDANCE_POLICY.DAYS_IN_MONTH; // 30
const LATE_FEE = ATTENDANCE_POLICY.LATE_FEE_PER_DAY; // 50
const MONTHLY_ACCRUAL = ATTENDANCE_POLICY.MONTHLY_PAID_LEAVE_ACCRUAL; // 2
const PAID_TYPES = ATTENDANCE_POLICY.PAID_QUOTA_LEAVE_TYPES; // [CASUAL, SICK]
const AUTHORISED_TYPES = ATTENDANCE_POLICY.AUTHORISED_LEAVE_TYPES; // [MEDICAL, MATERNITY, PATERNITY]

const round = (n) => Math.round((Number(n) || 0));
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Inclusive count of days of [aStart,aEnd] that fall within [mStart,mEnd)
const overlapDays = (aStart, aEnd, mStart, mEnd) => {
  const s = new Date(Math.max(new Date(aStart).getTime(), mStart.getTime()));
  const e = new Date(Math.min(new Date(aEnd).getTime(), mEnd.getTime() - 1));
  if (e < s) return 0;
  const ms = e.setHours(0, 0, 0, 0) - new Date(s).setHours(0, 0, 0, 0);
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
};

// ------------------------------------------------------------
// CORE COMPUTATION — used by BOTH preview and generate so the
// numbers can never diverge between what HR sees and what is saved.
//
// IMPORTANT: this walks EVERY calendar day of the month. A day with no
// attendance record is treated as ABSENT (Loss of Pay) — not ignored —
// except weekly offs, holidays, approved leave, pre-joining and future days.
// ------------------------------------------------------------
const pad = (n) => String(n).padStart(2, "0");
const dateKey = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

const computePayrollForEmployee = ({
  employee,
  attendance,
  leaves,
  month,
  year,
  money = {}, // { incentives, salary_advance, reimbursement }
}) => {
  const monthlyGross = employee.ctc ? employee.ctc / 12 : 0; // CTC is ANNUAL
  const perDay = monthlyGross / DAYS_IN_MONTH;
  const calendarDays = new Date(year, month, 0).getDate();

  // --- Index attendance by IST date key (an HR edit lives here and wins) ---
  const attByDate = {};
  for (const a of attendance) {
    const k = toISTDateKey(a.date);
    if (k) attByDate[k] = a;
  }

  // --- Expand approved leaves into a date -> leave_type map ---
  const leaveByDate = {};
  for (const lv of leaves) {
    if (lv.status !== "APPROVED") continue;
    const s = new Date(lv.start_date);
    s.setHours(0, 0, 0, 0);
    const e = new Date(lv.end_date);
    e.setHours(0, 0, 0, 0);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      leaveByDate[dateKey(d.getFullYear(), d.getMonth() + 1, d.getDate())] =
        lv.leave_type;
    }
  }

  const joining = employee.dateOfJoining ? new Date(employee.dateOfJoining) : null;
  if (joining) joining.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let days_present = 0;
  let half_days = 0;
  let late_days = 0;
  let days_absent = 0;
  let wfh_days = 0;
  let weekly_off_days = 0;
  let holiday_days = 0;
  let pre_joining_days = 0;
  let future_days = 0;
  let authorised_leave_days = 0;
  const clslKeys = []; // CL/SL days, chronological — quota applied in order

  for (let day = 1; day <= calendarDays; day++) {
    const d = new Date(year, month - 1, day);
    d.setHours(0, 0, 0, 0);
    const k = dateKey(year, month, day);

    // 1. Not employed yet -> pro-rata, NOT loss of pay
    if (joining && d < joining) {
      pre_joining_days++;
      continue;
    }

    // 2. Day hasn't happened yet -> never penalised
    if (ATTENDANCE_POLICY.PAY_FUTURE_DAYS && d > today) {
      future_days++;
      continue;
    }

    // 3. An attendance record ALWAYS wins (this is how an HR edit reaches payroll,
    //    and it lets HR mark someone present on a weekly off if they worked)
    const rec = attByDate[k];
    if (rec) {
      switch (rec.status) {
        case "HALF_DAY":
          half_days++;
          break;
        case "PRESENT":
          days_present++;
          if (rec.is_late) late_days++;
          break;
        case "WFH":
          wfh_days++;
          if (rec.is_late) late_days++;
          break;
        case "ABSENT":
          days_absent++;
          break;
        case "CASUAL_LEAVE":
        case "SICK_LEAVE":
        case "ON_LEAVE":
          clslKeys.push(k);
          break;
        default:
          days_present++;
      }
      continue;
    }

    // 4. Weekly off / holiday -> PAID (30-day basis), never absent
    if (isNonWorkingDay(year, month, day)) {
      const isHol = ATTENDANCE_POLICY.HOLIDAYS.includes(k);
      if (isHol) holiday_days++;
      else weekly_off_days++;
      continue;
    }

    // 5. Approved leave from the Leave module
    const lt = leaveByDate[k];
    if (lt) {
      if (AUTHORISED_TYPES.includes(lt)) authorised_leave_days++;
      else clslKeys.push(k); // CL / SL / anything else -> draws the paid quota
      continue;
    }

    // 6. No record, working day -> ABSENT (Loss of Pay)
    days_absent++;
  }

  // --- Paid-leave quota & carry-forward (first N leave days are the paid ones) ---
  const opening = Number(employee.paid_leave_balance) || 0;
  const accrued = MONTHLY_ACCRUAL;
  const entitlement = opening + accrued;
  const cl_sl_days = clslKeys.length;
  const leave_paid = Math.min(cl_sl_days, entitlement);
  const unpaid_leave_days = Math.max(0, cl_sl_days - leave_paid);

  // Absent days may absorb whatever paid-leave balance is left over
  let absent_covered_by_leave = 0;
  if (ATTENDANCE_POLICY.AUTO_APPLY_PAID_LEAVE_TO_ABSENCE) {
    absent_covered_by_leave = Math.min(days_absent, entitlement - leave_paid);
  }
  const absent_lop_days = days_absent - absent_covered_by_leave;

  const paid_leaves_used = leave_paid + absent_covered_by_leave;
  const closing = entitlement - paid_leaves_used;

  // --- Days & pay ---
  const lop_days = absent_lop_days + unpaid_leave_days + 0.5 * half_days;
  const payable_days =
    days_present +
    wfh_days +
    weekly_off_days +
    holiday_days +
    authorised_leave_days +
    paid_leaves_used +
    future_days +
    0.5 * half_days;

  // Pre-joining days are pro-rated out of the gross, but are NOT "loss of pay"
  const lop_amount = perDay * lop_days;
  const pre_joining_amount = perDay * pre_joining_days;
  const earned_salary = monthlyGross - lop_amount - pre_joining_amount;

  // --- Manual money (Policy 4/5/6) ---
  const incentives = Math.max(0, Number(money.incentives) || 0);
  const reimbursement = Math.max(0, Number(money.reimbursement) || 0);
  const salary_advance = Math.max(0, Number(money.salary_advance) || 0);

  // --- Deductions (NO PF / NO ESI / NO tax) ---
  const late_deduction = late_days * LATE_FEE;
  const total_deductions = late_deduction + salary_advance;

  const net_salary =
    earned_salary + incentives + reimbursement - late_deduction - salary_advance;

  return {
    employee_id: employee._id,
    employee_name: employee.name,
    employee_id_str: employee.employee_id,

    monthly_gross: round(monthlyGross),
    per_day_salary: round2(perDay),
    days_in_month: DAYS_IN_MONTH,
    calendar_days: calendarDays,

    days_present,
    half_days,
    late_days,
    days_absent,
    wfh_days,
    weekly_off_days,
    holiday_days,
    pre_joining_days,
    future_days,
    paid_leaves_used,
    absent_covered_by_leave,
    unpaid_leave_days,
    authorised_leave_days,

    payable_days: round2(payable_days),
    lop_days: round2(lop_days),

    earned_salary: round(earned_salary),
    incentives: round(incentives),
    reimbursement: round(reimbursement),

    late_deduction: round(late_deduction),
    salary_advance: round(salary_advance),
    lop_amount: round(lop_amount),
    pre_joining_amount: round(pre_joining_amount),
    total_deductions: round(total_deductions),

    gross_salary: round(monthlyGross),
    net_salary: round(net_salary),

    paid_leave_opening: round2(opening),
    paid_leave_accrued: accrued,
    paid_leave_closing: round2(closing),
  };
};

// Fetch attendance + leave for a set of employees for a month, grouped.
const loadMonthData = async (employees, month, year) => {
  const monthStart = new Date(year, month - 1, 1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(year, month, 1);
  monthEnd.setHours(0, 0, 0, 0);

  const empStrIds = employees.map((e) => e.employee_id).filter(Boolean);
  const empObjIds = employees.map((e) => e._id);

  const [attendance, leaves] = await Promise.all([
    AttendanceModel.find({
      employee_id: { $in: empStrIds },
      date: { $gte: monthStart, $lt: monthEnd },
    }),
    Leave.find({
      employee_id: { $in: empObjIds },
      status: "APPROVED",
      // any leave that could overlap the month
      start_date: { $lt: monthEnd },
      end_date: { $gte: monthStart },
    }),
  ]);

  const attByEmp = {};
  for (const a of attendance) {
    (attByEmp[a.employee_id] ||= []).push(a);
  }
  const leaveByEmp = {};
  for (const lv of leaves) {
    (leaveByEmp[String(lv.employee_id)] ||= []).push(lv);
  }

  return { monthStart, monthEnd, attByEmp, leaveByEmp };
};

// ============================================================
// ✅ PREVIEW — compute (WITHOUT saving) for the Generate review table
// POST /payroll/preview  { month, year }
// ============================================================
export const previewPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year)
      return res.status(400).json({ status: false, message: "Month and year are required" });

    const existing = await Payroll.countDocuments({ month, year });
    if (existing > 0)
      return res.status(400).json({
        status: false,
        message: `Payroll for ${month}/${year} already exists (${existing} records). Delete it first to regenerate.`,
      });

    const employees = await Employee.find({ status: "Active" });
    if (employees.length === 0)
      return res.status(400).json({ status: false, message: "No active employees found" });

    const { attByEmp, leaveByEmp } = await loadMonthData(
      employees,
      month,
      year
    );

    const rows = employees.map((emp) =>
      computePayrollForEmployee({
        employee: emp,
        attendance: attByEmp[emp.employee_id] || [],
        leaves: leaveByEmp[String(emp._id)] || [],
        month,
        year,
      })
    );

    return res.status(200).json({
      status: true,
      message: "Payroll preview computed",
      data: { month, year, rows },
    });
  } catch (error) {
    console.error("❌ Error previewing payroll:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// ============================================================
// ✅ GENERATE — recompute server-side, save, update carry-forward
// POST /payroll/generate  { month, year, entries: [{ employee_id, incentives, salary_advance, reimbursement }] }
// ============================================================
export const generatePayroll = async (req, res) => {
  try {
    const { month, year, entries = [] } = req.body;

    if (!month || !year)
      return res.status(400).json({ status: false, message: "Month and year are required" });
    if (month < 1 || month > 12)
      return res.status(400).json({ status: false, message: "Invalid month (1-12)" });

    const existing = await Payroll.countDocuments({ month, year });
    if (existing > 0)
      return res.status(400).json({
        status: false,
        message: `Payroll for ${month}/${year} already exists. (${existing} records)`,
      });

    const employees = await Employee.find({ status: "Active" });
    if (employees.length === 0)
      return res.status(400).json({ status: false, message: "No active employees found" });

    // Map manual money inputs by employee _id
    const moneyByEmp = {};
    for (const e of entries) {
      if (e && e.employee_id) moneyByEmp[String(e.employee_id)] = e;
    }

    const { attByEmp, leaveByEmp } = await loadMonthData(
      employees,
      month,
      year
    );

    const records = [];
    const balanceUpdates = []; // { _id, closing }

    for (const emp of employees) {
      const computed = computePayrollForEmployee({
        employee: emp,
        attendance: attByEmp[emp.employee_id] || [],
        leaves: leaveByEmp[String(emp._id)] || [],
        month,
        year,
        money: moneyByEmp[String(emp._id)] || {},
      });

      // strip preview-only field
      const { authorised_leave_days, calendar_days, ...record } = computed;

      records.push({
        ...record,
        month,
        year,
        status: "GENERATED",
        payment_method: "BANK_TRANSFER",
        generated_by: "HR",
        notes: `Payroll for ${month}/${year} (30-day basis)`,
      });

      balanceUpdates.push({ _id: emp._id, closing: computed.paid_leave_closing });
    }

    const created = await Payroll.insertMany(records);

    // Persist carry-forward balances (only after successful save)
    await Promise.all(
      balanceUpdates.map((b) =>
        Employee.updateOne({ _id: b._id }, { $set: { paid_leave_balance: b.closing } })
      )
    );

    return res.status(201).json({
      status: true,
      message: `Payroll generated for ${created.length} employees`,
      data: {
        month,
        year,
        total_employees: created.length,
        total_gross: created.reduce((s, p) => s + p.gross_salary, 0),
        total_deductions: created.reduce((s, p) => s + p.total_deductions, 0),
        total_net: created.reduce((s, p) => s + p.net_salary, 0),
      },
    });
  } catch (error) {
    console.error("❌ Error generating payroll:", error);
    return res.status(500).json({ status: false, message: error.message || "Failed to generate payroll" });
  }
};

// ============================================================
// GET ALL
// ============================================================
export const getAllPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.find()
      .populate("employee_id", "name email jobTitle department")
      .sort({ year: -1, month: -1 });
    return res.status(200).json({ status: true, message: "Payroll fetched successfully", data: payroll });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate(
      "employee_id",
      "name email jobTitle department employee_id"
    );
    if (!payroll) return res.status(404).json({ status: false, message: "Payroll record not found" });
    return res.status(200).json({ status: true, message: "Payroll fetched successfully", data: payroll });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getPayrollByMonth = async (req, res) => {
  try {
    const { month, year } = req.params;
    const payroll = await Payroll.find({ month: parseInt(month), year: parseInt(year) })
      .populate("employee_id", "name email jobTitle department")
      .sort({ employee_name: 1 });
    return res.status(200).json({ status: true, message: "Payroll fetched successfully", data: payroll });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getPayrollByEmployee = async (req, res) => {
  try {
    const payroll = await Payroll.find({ employee_id: req.params.employeeId })
      .populate("employee_id", "name email jobTitle department")
      .sort({ year: -1, month: -1 });
    return res.status(200).json({ status: true, message: "Payroll fetched successfully", data: payroll });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// ============================================================
// UPDATE — recompute net when money/day fields are edited by HR
// ============================================================
export const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Payroll.findById(id);
    if (!existing) return res.status(404).json({ status: false, message: "Payroll record not found" });

    const merged = { ...existing.toObject(), ...req.body };

    // Recompute derived money so the slip stays internally consistent
    const perDay = Number(merged.per_day_salary) || 0;
    const lop_days = Number(merged.lop_days) || 0;
    const lop_amount = Math.round(perDay * lop_days);
    const earned_salary = Math.round((Number(merged.monthly_gross) || 0) - perDay * lop_days);
    const late_deduction = Math.round(Number(merged.late_deduction) || 0);
    const salary_advance = Math.round(Number(merged.salary_advance) || 0);
    const incentives = Math.round(Number(merged.incentives) || 0);
    const reimbursement = Math.round(Number(merged.reimbursement) || 0);
    const total_deductions = late_deduction + salary_advance;
    const net_salary =
      earned_salary + incentives + reimbursement - late_deduction - salary_advance;

    Object.assign(existing, req.body, {
      lop_amount,
      earned_salary,
      total_deductions,
      net_salary,
    });

    await existing.save();
    return res.status(200).json({ status: true, message: "Payroll updated successfully", data: existing });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const approvePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ status: false, message: "Payroll record not found" });
    payroll.status = "APPROVED";
    payroll.approved_by = req.body.approved_by || "HR";
    payroll.approved_date = new Date();
    await payroll.save();
    return res.status(200).json({ status: true, message: "Payroll approved successfully", data: payroll });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const markPayrollAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ status: false, message: "Payroll record not found" });
    payroll.status = "PAID";
    payroll.payment_date = req.body.payment_date || new Date();
    payroll.payment_method = req.body.payment_method || "BANK_TRANSFER";
    await payroll.save();
    return res.status(200).json({ status: true, message: "Payroll marked as paid successfully", data: payroll });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// DELETE — also refund the carry-forward balance change for that month
export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ status: false, message: "Payroll record not found" });

    // Reverse the paid-leave carry-forward that this record advanced,
    // so a delete + regenerate does not double-accrue.
    if (payroll.employee_id) {
      await Employee.updateOne(
        { _id: payroll.employee_id },
        { $set: { paid_leave_balance: payroll.paid_leave_opening } }
      );
    }

    return res.status(200).json({ status: true, message: "Payroll deleted successfully", data: payroll });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getPayrollStatistics = async (req, res) => {
  try {
    const [total, paid, approved, generated] = await Promise.all([
      Payroll.countDocuments(),
      Payroll.countDocuments({ status: "PAID" }),
      Payroll.countDocuments({ status: "APPROVED" }),
      Payroll.countDocuments({ status: "GENERATED" }),
    ]);

    const agg = await Payroll.aggregate([
      {
        $group: {
          _id: null,
          totalGross: { $sum: "$gross_salary" },
          totalDeductions: { $sum: "$total_deductions" },
          totalNet: { $sum: "$net_salary" },
        },
      },
    ]);
    const stats = agg[0] || { totalGross: 0, totalDeductions: 0, totalNet: 0 };

    return res.status(200).json({
      status: true,
      message: "Payroll statistics fetched successfully",
      data: { counts: { total, paid, approved, generated }, totals: stats },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export default {
  previewPayroll,
  generatePayroll,
  getAllPayroll,
  getPayrollById,
  getPayrollByMonth,
  getPayrollByEmployee,
  updatePayroll,
  approvePayroll,
  markPayrollAsPaid,
  deletePayroll,
  getPayrollStatistics,
};
