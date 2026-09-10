import mongoose from "mongoose";
import "../../appointment/appointment.model.js";

const campaignSchema = new mongoose.Schema(
  {
    campaign_id: { type: String, unique: true },
    channelName: { type: String, required: true },
    channel: { type: String },
    campaignId: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number },
    leads: { type: Number },
    cpl: { type: Number },
    leads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Leads" }],
    appointments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Appointments" },
    ],
      
  },

  { timestamps: true }
);

const CampaignModel = mongoose.model("Campaigns", campaignSchema);

export default CampaignModel;
