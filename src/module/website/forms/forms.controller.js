// ============================================
// FILE: src/module/website/forms/forms.controller.js
// PURPOSE: API endpoints for website form submissions
// ============================================

import WebsiteFormService from "./forms.service.js";

// ============================================
// BOOK NOW FORM ENDPOINTS
// ============================================

export const submitBookNow = async (req, res) => {
  try {
    const data = {
      ...req.body,
      source: "website_book_now",
      status: "new",
    };

    const result = await WebsiteFormService.submitBookNow(data);

    res.status(201).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Book Now submission error:", error);
    res.status(400).json({
      status: false,
      message: error.message || "Failed to submit book now request",
    });
  }
};

export const getBookNowRequests = async (req, res) => {
  try {
    const { status, assigned_to } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (assigned_to) filters.assigned_to = assigned_to;

    const requests = await WebsiteFormService.getAllBookNow(filters);

    res.status(200).json({
      status: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch book now requests",
    });
  }
};

export const updateBookNowRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await WebsiteFormService.updateBookNow(id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Book now request not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Book now request updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to update request",
    });
  }
};

// ============================================
// CORPORATE WELLNESS FORM ENDPOINTS
// ============================================

export const submitCorporateWellness = async (req, res) => {
  try {
    const data = {
      ...req.body,
      source: "website_corporate_wellness",
      status: "new",
    };

    const result = await WebsiteFormService.submitCorporateWellness(data);

    res.status(201).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message || "Failed to submit corporate wellness inquiry",
    });
  }
};

export const getCorporateWellnessInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};

    const inquiries = await WebsiteFormService.getAllCorporateWellness(filters);

    res.status(200).json({
      status: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch inquiries",
    });
  }
};

export const updateCorporateWellnessInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await WebsiteFormService.updateCorporateWellness(
      id,
      req.body
    );

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Inquiry not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Inquiry updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to update inquiry",
    });
  }
};

// ============================================
// INSURANCE PARTNER FORM ENDPOINTS
// ============================================

export const submitInsurancePartner = async (req, res) => {
  try {
    const data = {
      ...req.body,
      source: "website_insurance_partner",
      status: "new",
    };

    const result = await WebsiteFormService.submitInsurancePartner(data);

    res.status(201).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message || "Failed to submit insurance partner inquiry",
    });
  }
};

export const getInsurancePartnerInquiries = async (req, res) => {
  try {
    const inquiries = await WebsiteFormService.getAllInsurancePartners();

    res.status(200).json({
      status: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch insurance partners",
    });
  }
};

// ============================================
// PARTNER WITH US FORM ENDPOINTS
// ============================================

export const submitPartnerWithUs = async (req, res) => {
  try {
    const data = {
      ...req.body,
      source: "website_partner_with_us",
      status: "new",
    };

    const result = await WebsiteFormService.submitPartnerWithUs(data);

    res.status(201).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message || "Failed to submit partnership inquiry",
    });
  }
};

export const getPartnershipInquiries = async (req, res) => {
  try {
    const inquiries = await WebsiteFormService.getAllPartnerRequests();

    res.status(200).json({
      status: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch partnership inquiries",
    });
  }
};

// ============================================
// DOCTOR ONBOARDING FORM ENDPOINTS
// ============================================

export const submitDoctorOnboarding = async (req, res) => {
  try {
    const data = {
      ...req.body,
      source: "website_doctor_onboarding",
      status: "new",
      documents: req.body.documents || {},
    };

    const result = await WebsiteFormService.submitDoctorOnboarding(data);

    res.status(201).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message || "Failed to submit doctor onboarding application",
    });
  }
};

export const getDoctorApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};

    const applications = await WebsiteFormService.getAllDoctorApplications(
      filters
    );

    res.status(200).json({
      status: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch doctor applications",
    });
  }
};

export const updateDoctorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await WebsiteFormService.updateDoctorApplication(
      id,
      req.body
    );

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Application updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to update application",
    });
  }
};

// ============================================
// CONTACT US FORM ENDPOINTS
// ============================================

export const submitContactUs = async (req, res) => {
  try {
    const data = {
      ...req.body,
      source: "website_contact_us",
      status: "new",
    };

    const result = await WebsiteFormService.submitContactUs(data);

    res.status(201).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message || "Failed to submit contact inquiry",
    });
  }
};

export const getContactInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};

    const inquiries = await WebsiteFormService.getAllContactInquiries(filters);

    res.status(200).json({
      status: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch contact inquiries",
    });
  }
};

export const updateContactInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await WebsiteFormService.updateContactInquiry(id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Inquiry not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Inquiry updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to update inquiry",
    });
  }
};

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

// ============================================
// UPDATE HANDLERS (Insurance & Partner — were missing)
// ============================================

export const updateInsurancePartnerInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await WebsiteFormService.updateInsurancePartner(id, req.body);
    if (!updated) {
      return res.status(404).json({ status: false, message: "Inquiry not found" });
    }
    res.status(200).json({
      status: true,
      message: "Inquiry updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to update inquiry",
    });
  }
};

export const updatePartnerWithUsInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await WebsiteFormService.updatePartnerRequest(id, req.body);
    if (!updated) {
      return res.status(404).json({ status: false, message: "Inquiry not found" });
    }
    res.status(200).json({
      status: true,
      message: "Inquiry updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to update inquiry",
    });
  }
};

// ============================================
// DELETE HANDLERS (all 6 form types)
// ============================================

const makeDeleteHandler = (serviceFn, label) => async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await serviceFn(id);
    if (!deleted) {
      return res.status(404).json({ status: false, message: `${label} not found` });
    }
    res.status(200).json({ status: true, message: `${label} deleted successfully` });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || `Failed to delete ${label.toLowerCase()}`,
    });
  }
};

export const deleteBookNowRequest = makeDeleteHandler(
  WebsiteFormService.deleteBookNow,
  "Book now request"
);
export const deleteCorporateWellnessInquiry = makeDeleteHandler(
  WebsiteFormService.deleteCorporateWellness,
  "Corporate wellness inquiry"
);
export const deleteInsurancePartnerInquiry = makeDeleteHandler(
  WebsiteFormService.deleteInsurancePartner,
  "Insurance partner inquiry"
);
export const deletePartnerWithUsInquiry = makeDeleteHandler(
  WebsiteFormService.deletePartnerRequest,
  "Partnership inquiry"
);
export const deleteDoctorApplicationRequest = makeDeleteHandler(
  WebsiteFormService.deleteDoctorApplication,
  "Doctor application"
);
export const deleteContactInquiry = makeDeleteHandler(
  WebsiteFormService.deleteContactInquiry,
  "Contact inquiry"
);

export const getFormSubmissionStats = async (req, res) => {
  try {
    const stats = await WebsiteFormService.getFormSubmissionStats();

    res.status(200).json({
      status: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch statistics",
    });
  }
};
