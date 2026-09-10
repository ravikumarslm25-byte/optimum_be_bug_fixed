import CampaignService from "./campaign.service.js";

export const createCampaign = async (req, res) => {
  try {
    const data = await CampaignService.createCampaign(req.body);
    res.status(201).json({
      status: true,
      message: "Campaign created successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

export const getAllCampaigns = async (req, res) => {
  try {
    const data = await CampaignService.getAllCampaigns();
    res.status(200).json({
      status: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaign = await CampaignService.getCampaignById(req.params.id);
    if (!campaign)
      return res
        .status(404)
        .json({ status: false, message: "Campaign not found" });

    res.status(200).json({ status: true, data: campaign });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ NEW: Update/Edit Campaign
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ID
    if (!id) {
      return res
        .status(400)
        .json({ status: false, message: "Campaign ID is required" });
    }

    // Warn if trying to update campaign_id
    if (updateData.campaign_id) {
      return res.status(400).json({
        status: false,
        message: "Campaign ID cannot be edited",
      });
    }

    const updatedCampaign = await CampaignService.updateCampaign(
      id,
      updateData
    );

    res.status(200).json({
      status: true,
      message: "Campaign updated successfully",
      data: updatedCampaign,
    });
  } catch (error) {
    if (error.message === "Campaign not found") {
      return res
        .status(404)
        .json({ status: false, message: "Campaign not found" });
    }
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ NEW: Delete Campaign
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res
        .status(400)
        .json({ status: false, message: "Campaign ID is required" });
    }

    const result = await CampaignService.deleteCampaign(id);

    res.status(200).json({
      status: true,
      message: result.message,
      data: {
        deletedId: result.deletedCampaignId,
        campaignName: result.campaignName,
      },
    });
  } catch (error) {
    if (error.message === "Campaign not found") {
      return res
        .status(404)
        .json({ status: false, message: "Campaign not found" });
    }
    res.status(500).json({ status: false, message: error.message });
  }
};

export const whatsappInitialLeadController = async (req, res) => {
  try {
    const { campaignId, phone, name } = req.body;
    console.log(campaignId, phone, name, "watsapp data");

    if (!campaignId || !phone) {
      return res.status(400).json({
        status: false,
        message: "campaignId and phone required",
      });
    }

    const result = await CampaignService.checkWhatsAppLead(
      campaignId,
      phone,
      name
    );
    console.log(result, "watapp leads");

    res.status(201).json({ status: true, ...result });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
    console.log(err.message, "watsapp error");
  }
};

export const whatsappFormUpdateController = async (req, res) => {
  try {
    const result = await CampaignService.updateWhatsAppLeadForm(req.body);
    res.status(200).json({ status: true, ...result });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
