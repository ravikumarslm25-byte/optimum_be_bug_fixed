import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    doctor_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Invalid phone number"],
    },
    pending_payment: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave"],
      default: "active",
    },
    age: {
      type: Number,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    circle: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const DoctorModel = mongoose.model("Doctors", doctorSchema);

export default DoctorModel;
