import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    attendance_id: {
      type: String,
      unique: true,
    },
    employee_id: {
      type: String,
      ref: "Employees",
      required: true,
    },
    employee_name: String,
    date: {
      type: Date,
      required: true,
    },
    check_in_time: Date,
    check_out_time: Date,
    work_hours: {
      type: Number,
      default: 0,
    },
    // ✅ LATE FLAG (check-in after 9:45 AM IST) — drives the flat late-fee in payroll
    is_late: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "HALF_DAY", "SICK_LEAVE", "CASUAL_LEAVE", "ON_LEAVE", "WFH"],
      default: "ABSENT",
    },
    // ✅ AUDIT — who last overrode this record from the admin side
    edited_by: { type: String, default: null },
    edited_at: { type: Date, default: null },
    remarks: String,
  },
  { timestamps: true }
);

const AttendanceModel = mongoose.model("Attendances", attendanceSchema);

export default AttendanceModel;
