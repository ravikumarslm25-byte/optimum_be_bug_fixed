import AttendanceModel from "./attendance.model.js";
import EmployeeModel from "../employee/employee.model.js";
import Payroll from "../payroll/payroll.model.js";
import { classifyCheckIn } from "../../config/attendancePolicy.js";

// ============================================================
// 🔒 PAYROLL LOCK
// Once payroll is generated for a month, that month's attendance is frozen
// so the payslips can never drift from the attendance they were built on.
// ============================================================
const isMonthLocked = async (dateLike) => {
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) return false;
  const count = await Payroll.countDocuments({
    month: d.getMonth() + 1,
    year: d.getFullYear(),
  });
  return count > 0;
};

const lockedResponse = (res, d) =>
  res.status(423).json({
    status: false,
    locked: true,
    message: `Attendance for ${new Date(d).toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    })} is locked because payroll has already been generated for that month.`,
  });

// ✅ Lock status for a month — lets the UI disable editing
// GET /attendance/lock-status/:year/:month
export const getAttendanceLockStatus = async (req, res) => {
  try {
    const { year, month } = req.params;
    const count = await Payroll.countDocuments({
      month: parseInt(month),
      year: parseInt(year),
    });
    return res.status(200).json({
      status: true,
      data: { locked: count > 0, payroll_records: count },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Check in
export const checkIn = async (req, res) => {
  try {
    const { employee_id } = req.body;

    // ✅ FIXED: Use findOne with string employee_id, not findById with ObjectId
    const employee = await EmployeeModel.findOne({ employee_id: employee_id });
    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    let attendance = await AttendanceModel.findOne({
      employee_id,
      date: { $gte: today },
    });

    if (attendance) {
      return res.status(400).json({
        status: false,
        message: "Already checked in today",
      });
    }

    // Create new attendance
    const count = await AttendanceModel.countDocuments();
    const attendance_id = `ATT-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(
      count + 1
    ).padStart(4, "0")}`;

    // ✅ POLICY: classify the check-in time (IST)
    //   after 12:00 PM -> HALF_DAY, after 9:45 AM -> late (flat fee in payroll)
    const now = new Date();
    const { isLate, isHalfDay } = classifyCheckIn(now);

    attendance = await AttendanceModel.create({
      attendance_id,
      employee_id,
      employee_name: employee.name,
      date: now,
      check_in_time: now,
      is_late: isLate,
      status: isHalfDay ? "HALF_DAY" : "PRESENT",
    });

    res.status(201).json({
      status: true,
      message: isHalfDay
        ? "Checked in after 12:00 PM — marked as Half Day"
        : isLate
        ? "Checked in successfully (Late — after 9:45 AM)"
        : "Checked in successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Check in error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Check out
export const checkOut = async (req, res) => {
  try {
    const { employee_id } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await AttendanceModel.findOne({
      employee_id,
      date: { $gte: today },
    });

    if (!attendance) {
      return res.status(404).json({
        status: false,
        message: "No check-in found for today",
      });
    }

    if (attendance.check_out_time) {
      return res.status(400).json({
        status: false,
        message: "Already checked out",
      });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.check_in_time);
    const workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    attendance.check_out_time = checkOutTime;
    attendance.work_hours = parseFloat(workHours.toFixed(2));

    await attendance.save();

    res.status(200).json({
      status: true,
      message: "Checked out successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Check out error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Manual attendance entry
export const manualAttendance = async (req, res) => {
  try {
    const { employee_id, date, status, remarks } = req.body;

    if (!employee_id || !date || !status) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields",
      });
    }

    // ✅ FIXED: Use findOne with string employee_id, not findById with ObjectId
    const employee = await EmployeeModel.findOne({ employee_id: employee_id });
    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // 🔒 Block edits once payroll for that month exists
    if (await isMonthLocked(attendanceDate)) {
      return lockedResponse(res, attendanceDate);
    }

    // Check if already exists
    let attendance = await AttendanceModel.findOne({
      employee_id,
      date: attendanceDate,
    });

    if (attendance) {
      // Update existing
      attendance.status = status;
      attendance.remarks = remarks;
      // An HR override clears the automatic late flag unless explicitly set
      if (typeof req.body.is_late === "boolean") attendance.is_late = req.body.is_late;
      else if (status !== "PRESENT" && status !== "WFH") attendance.is_late = false;
      attendance.edited_by = req.body.edited_by || "HR";
      attendance.edited_at = new Date();
      await attendance.save();
    } else {
      // Create new
      const count = await AttendanceModel.countDocuments();
      const attendance_id = `ATT-${attendanceDate.toISOString().slice(0, 7).replace("-", "")}-${String(
        count + 1
      ).padStart(4, "0")}`;

      attendance = await AttendanceModel.create({
        attendance_id,
        employee_id,
        employee_name: employee.name,
        date: attendanceDate,
        status,
        remarks,
        is_late: typeof req.body.is_late === "boolean" ? req.body.is_late : false,
        edited_by: req.body.edited_by || "HR",
        edited_at: new Date(),
      });
    }

    res.status(200).json({
      status: true,
      message: "Attendance marked",
      data: attendance,
    });
  } catch (error) {
    console.error("Manual attendance error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Get monthly attendance
export const getMonthlyAttendance = async (req, res) => {
  try {
    const { month } = req.params;
    // month format: YYYY-MM

    const [year, monthNum] = month.split("-");
    const startDate = new Date(`${year}-${monthNum}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const attendance = await AttendanceModel.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    }).sort({ date: 1 });

    // Ensure employee_name is set
    const attendanceWithNames = attendance.map(att => {
      const attObj = att.toObject();
      if (!attObj.employee_name && attObj.employee_id) {
        attObj.employee_name = attObj.employee_id.name;
      }
      return attObj;
    });

    res.status(200).json({
      status: true,
      data: attendanceWithNames,
    });
  } catch (error) {
    console.error("Get monthly attendance error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Get employee attendance
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { month } = req.query;

    let query = { employee_id };

    if (month) {
      const [year, monthNum] = month.split("-");
      const startDate = new Date(`${year}-${monthNum}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      query.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const attendance = await AttendanceModel.find(query).sort({ date: -1 });

    res.status(200).json({
      status: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Get employee attendance error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Update attendance
export const updateAttendance = async (req, res) => {
  try {
    const { attendance_id } = req.params;
    const { status, remarks } = req.body;

    const existing = await AttendanceModel.findById(attendance_id);
    if (!existing) {
      return res.status(404).json({
        status: false,
        message: "Attendance not found",
      });
    }

    // 🔒 Block edits once payroll for that month exists
    if (await isMonthLocked(existing.date)) {
      return lockedResponse(res, existing.date);
    }

    const update = { status, remarks, edited_by: req.body.edited_by || "HR", edited_at: new Date() };
    if (typeof req.body.is_late === "boolean") update.is_late = req.body.is_late;
    else if (status && status !== "PRESENT" && status !== "WFH") update.is_late = false;

    const attendance = await AttendanceModel.findByIdAndUpdate(
      attendance_id,
      update,
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Attendance updated",
      data: attendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Delete attendance
export const deleteAttendance = async (req, res) => {
  try {
    const { attendance_id } = req.params;

    const existingDel = await AttendanceModel.findById(attendance_id);
    if (existingDel && (await isMonthLocked(existingDel.date))) {
      return lockedResponse(res, existingDel.date);
    }

    const attendance = await AttendanceModel.findByIdAndDelete(attendance_id);

    if (!attendance) {
      return res.status(404).json({
        status: false,
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Attendance deleted",
    });
  } catch (error) {
    console.error("Delete attendance error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
