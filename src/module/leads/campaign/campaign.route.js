import { Router } from "express";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  whatsappFormUpdateController,
  whatsappInitialLeadController,
} from "./campaign.controller.js";

const campaignRoute = Router();

// ✅ Create Campaign
campaignRoute.post("/create", createCampaign);

// ✅ Get all campaigns
campaignRoute.get("/allcampaigns", getAllCampaigns);

// ✅ Get single campaign by ID
campaignRoute.get("/:id", getCampaignById);

// ✅ NEW: Update/Edit Campaign (PUT)
campaignRoute.put("/:id", updateCampaign);

// ✅ NEW: Delete Campaign (DELETE)
campaignRoute.delete("/:id", deleteCampaign);

// WhatsApp integrations
campaignRoute.post("/whatsapp/createlead", whatsappInitialLeadController);
campaignRoute.put("/whatsapp/updatelead", whatsappFormUpdateController);

export default campaignRoute;
