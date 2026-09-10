import LeadService from "./lead.service.js";
import jwt from "jsonwebtoken";

// ===============================
// CREATE LEAD
// ===============================
export const createLead = async (req, res) => {
  try {
    const lead = await LeadService.createLead(req.body);
    res.status(201).json({ status: true, data: lead });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};





export const getAllLeads = async (req, res) => {
  try {
    const { role_name, name, department, category_name } = req.query;

    if (!name) {
      return res.status(400).json({
        status: false,
        message: "name is required",
      });
    }

    const leads = await LeadService.getLeadsByRole(role_name, name, department, category_name);

    res.status(200).json({
      status: true,
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};






// ===============================
// ⚡ DASHBOARD STATS — counts + top performers computed in Mongo
// ===============================
export const getLeadByLeadId = async (req, res) => {
  try {
    const lead = await LeadService.getLeadByLeadId(req.params.leadId);
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getLeadDashboardStats = async (req, res) => {
  try {
    const { role_name, name, department, category_name } = req.query;

    const stats = await LeadService.getDashboardStats(
      role_name,
      name,
      department,
      category_name
    );

    res.status(200).json({ status: true, data: stats });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ===============================
// TRANSFER LEADS
// ===============================
export const transferLeads = async (req, res) => {
  try {
    const { leadIds, bdname } = req.body;

    await LeadService.transferLeads(leadIds, bdname);

    res.status(200).json({
      status: true,
      message: "Leads transferred successfully & Notification sent to BD",
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ===============================
// DELETE LEAD
// ===============================
export const bulkDeleteLeads = async (req, res) => {
  try {
    const { leadIds } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "No leads selected for deletion" });
    }
    const deletedCount = await LeadService.bulkDeleteLeads(leadIds);
    res.status(200).json({
      status: true,
      message: `${deletedCount} lead(s) deleted successfully`,
      data: { deletedCount },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const deleteLeadDocument = async (req, res) => {
  try {
    const { leadId, documentId } = req.params;
    const documents = await LeadService.deleteDocument(leadId, documentId);
    res.status(200).json({
      status: true,
      message: "Document deleted successfully",
      data: documents,
    });
  } catch (error) {
    const code = error.message === "Lead not found" || error.message === "Document not found" ? 404 : 500;
    res.status(code).json({ status: false, message: error.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    await LeadService.deleteLead(req.params.id);
    res.status(200).json({ status: true, message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};





export const addFollowUp = async (req, res) => {
  try {
    const followUp = await LeadService.addFollowUp(req.body);

    res.status(201).json({
      status: true,
      message: "Follow-up added successfully",
      data: followUp,
    });

  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};



export const getFollowUpsByLead = async (req, res) => {
  try {
    const data = await LeadService.getFollowUpsByLead(req.params.leadId);

    res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};


export const uploadLeadDocuments = async (req, res) => {
  try {
    const { leadId } = req.body;

    if (!req.files || !req.files.length) {
      return res.status(400).json({ status: false, message: "No files uploaded" });
    }

    const data = await LeadService.uploadDocuments(leadId, req.files);

    res.status(200).json({ status: true, data });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

export const getLeadDocuments = async (req, res) => {
  try {
    const documents = await LeadService.getDocumentsByLead(
      req.params.leadId
    );

    res.status(200).json({
      status: true,
      data: documents,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};


export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      email,
      age,
      weight,
      circle,
      notes,
      status,
      treatment,
      payment_mode,
      category,
    } = req.body;

    const updatedLead = await LeadService.updateLeadById(
      id,
      {
        name,
        phone,
        email,
        age,
        weight,
        circle,
        notes,
        status,
        treatment,
        payment_mode,
        category,
      }
    );

    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update lead",
      error: error.message,
    });
  }
};

// ===============================
// ✅ BULK UPLOAD LEADS
// ===============================
export const bulkUploadLeads = async (req, res) => {
  try {
    const { campaign_id, leads, allowDuplicates } = req.body;

    // ✅ Validation
    if (!campaign_id) {
      return res.status(400).json({
        success: false,
        message: "campaign_id is required",
      });
    }

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: "leads array is required and must not be empty",
      });
    }

    // ✅ Call service
    const result = await LeadService.bulkUploadLeads(campaign_id, leads, allowDuplicates);

    res.status(200).json({
      success: true,
      message: `Bulk upload successful`,
      data: result,
    });
  } catch (error) {
    console.error("❌ Bulk upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Bulk upload failed",
    });
  }
}

