import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    hospital_name: {
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
    address: {
      type: String,
      required: true,
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
    overdue: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
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

const HospitalModel = mongoose.model("Hospitals", hospitalSchema);

export default HospitalModel;
