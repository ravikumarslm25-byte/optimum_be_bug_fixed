import mongoose from "mongoose";
import "../leads/campaign/campaign.model.js";
import "../leads/lead/lead.model.js";

const appointmentSchema = new mongoose.Schema(
  {
    token_id: { type: String, unique: true, required: true },
    patient_type: { type: String, required: true }, // OPD or IPD
    patient_name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    treatment: { type: String },
    city: { type: String },
    surgeon_name: { type: String },
    medical_coordinator: { type: String },
    coordinator_number: { type: String },
    phone: { type: String }, // ✅ NEW: Patient phone number
    consultation_type: { type: String }, // Only for OPD
    op_time: { type: String }, // Only for OPD
    op_date: { type: String }, // Only for OPD
    surgery_date: { type: String }, // Only for IPD
    admission_time: { type: String }, // Only for IPD
    ot_time: { type: String }, // Only for IPD
    hospital_name: { type: String },
    hospital_address: { type: String },
    amount: { type: Number },
    payment_mode: { type: String },

    // ✅ BULK-UPLOAD / HISTORICAL columns (kept close to the OPD/IPD sheets;
    //    finance/settlement/invoice details are handled in the Invoice flow).
    month: { type: String }, // e.g. "JUNE"
    category: { type: String }, // IPD category (e.g. Cosmetic)
    lead_source: { type: String }, // META / DIRECT / REFERRAL ...
    bd_name: { type: String }, // BD / sales owner name (string, not a ref)
    ipd_status: { type: String }, // OPD-only: converted to IPD? (DONE / -)

    opd_number: { type: String, unique: true, sparse: true },
    ipd_number: { type: String, unique: true, sparse: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaigns" },
    campaign_id: { type: String },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Leads" },
    lead_id: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Confirmed", "Cancelled"], // optional but recommended
      default: "Pending",
    },
  },

  { timestamps: true }
);

const AppointmentModel = mongoose.model("Appointments", appointmentSchema);

export default AppointmentModel;
