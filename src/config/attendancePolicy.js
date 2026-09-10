// ============================================================
// FILE: src/config/attendancePolicy.js
// SINGLE SOURCE OF TRUTH for the client's Payroll & Attendance Policy
// ------------------------------------------------------------
// Policy reference (client-provided):
//  1. Salary on a 30-day basis. Per-day = Monthly Gross / 30.
//  2. Check-in after 9:45 AM  -> Late  -> flat Rs.50/day deduction.
//  3. Check-in after 12:00 PM -> Half Day -> pays 0.5 x per-day.
//  4. Incentives credited monthly (manual, added in payroll).
//  5. Salary advance (manual deduction, mgmt approval).
//  6. Reimbursement (manual addition, with valid docs).
//  7. Paid leave: 2 / month (1 Casual + 1 Sick).
//  8. Unused paid leave carried forward.
//  9. NO PF / NO ESI deductions.
// ============================================================

export const ATTENDANCE_POLICY = {
  // Timezone all check-in thresholds are evaluated in (Indian client)
  TIMEZONE: "Asia/Kolkata",

  // After this time -> LATE (flat fee applies)
  LATE_TIME: { hour: 9, minute: 45 }, // 09:45 -> 585 min

  // After this time -> HALF DAY (half pay)
  HALF_DAY_TIME: { hour: 12, minute: 0 }, // 12:00 -> 720 min

  // Flat late-coming deduction per late day (Rs.)
  LATE_FEE_PER_DAY: 50,

  // Salary is computed on a fixed 30-day month
  DAYS_IN_MONTH: 30,

  // Paid leaves accrued every month (1 Casual + 1 Sick)
  MONTHLY_PAID_LEAVE_ACCRUAL: 2,

  // Leave types that draw from the monthly paid-leave quota
  PAID_QUOTA_LEAVE_TYPES: ["CASUAL", "SICK"],

  // Leave types treated as authorised (no deduction, do NOT draw the quota).
  // Deducting these automatically would be unsafe (e.g. maternity), so they
  // are excluded from Loss-of-Pay until the client instructs otherwise.
  AUTHORISED_LEAVE_TYPES: ["MEDICAL", "MATERNITY", "PATERNITY"],

  // No statutory deductions per policy point 9
  APPLY_PF: false,
  APPLY_ESI: false,
  APPLY_INCOME_TAX: false,

  // ---- NON-WORKING DAYS -------------------------------------------------
  // Salary is on a 30-day basis, so weekly offs and holidays are PAID days.
  // They are never treated as absent / Loss of Pay.
  // 0 = Sunday, 1 = Monday ... 6 = Saturday
  WEEKLY_OFF_DAYS: [0],

  // Company holidays as "YYYY-MM-DD" (IST). Also paid, never LOP.
  // e.g. ["2026-01-26", "2026-08-15"]
  HOLIDAYS: [],

  // Should un-applied ABSENT days automatically consume the paid-leave
  // balance (this month's accrual + carry-forward) before becoming LOP?
  //   true  -> an employee absent 3 days with 2 CL available loses only 1 day
  //   false -> only formally approved leave is paid; every absence is LOP
  AUTO_APPLY_PAID_LEAVE_TO_ABSENCE: true,

  // If payroll is generated before the month has ended, days that have not
  // happened yet are NOT penalised (they are counted as paid).
  PAY_FUTURE_DAYS: true,
};

/** "YYYY-MM-DD" for a date, evaluated in IST */
export const toISTDateKey = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ATTENDANCE_POLICY.TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const dd = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${dd}`;
};

/** Is this a non-working (paid) day — weekly off or declared holiday? */
export const isNonWorkingDay = (year, month /* 1-12 */, day) => {
  const d = new Date(year, month - 1, day);
  if (ATTENDANCE_POLICY.WEEKLY_OFF_DAYS.includes(d.getDay())) return true;
  const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return ATTENDANCE_POLICY.HOLIDAYS.includes(key);
};

// Minutes-since-midnight for the two thresholds
export const LATE_THRESHOLD_MIN =
  ATTENDANCE_POLICY.LATE_TIME.hour * 60 + ATTENDANCE_POLICY.LATE_TIME.minute;
export const HALF_DAY_THRESHOLD_MIN =
  ATTENDANCE_POLICY.HALF_DAY_TIME.hour * 60 +
  ATTENDANCE_POLICY.HALF_DAY_TIME.minute;

/**
 * Return the check-in time expressed as minutes-since-midnight in the policy
 * timezone (IST), regardless of the server's own timezone.
 * @param {Date|string} date
 * @returns {number} minutes since midnight (0-1439), or -1 if invalid
 */
export const getMinutesSinceMidnightIST = (date) => {
  if (!date) return -1;
  const d = new Date(date);
  if (isNaN(d.getTime())) return -1;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ATTENDANCE_POLICY.TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0",
    10
  );
  return hour * 60 + minute;
};

/**
 * Classify a check-in time against the policy.
 * @param {Date|string} checkInTime
 * @returns {{ isLate: boolean, isHalfDay: boolean, minutes: number }}
 */
export const classifyCheckIn = (checkInTime) => {
  const minutes = getMinutesSinceMidnightIST(checkInTime);
  if (minutes < 0) return { isLate: false, isHalfDay: false, minutes: -1 };
  return {
    isLate: minutes > LATE_THRESHOLD_MIN,
    isHalfDay: minutes > HALF_DAY_THRESHOLD_MIN,
    minutes,
  };
};

export default ATTENDANCE_POLICY;
