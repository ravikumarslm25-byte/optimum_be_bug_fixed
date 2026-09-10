// ============================================
// FILE: src/module/website/forms/forms.route.js
// PURPOSE: Routes for website form submissions
// Public POST (from website) + admin GET/PUT/DELETE (from CRM)
// ============================================

import express from "express";
import * as formsController from "./forms.controller.js";

const router = express.Router();

// ============================================
// BOOK NOW
// ============================================
router.post("/book-now", formsController.submitBookNow);
router.get("/book-now", formsController.getBookNowRequests);
router.put("/book-now/:id", formsController.updateBookNowRequest);
router.delete("/book-now/:id", formsController.deleteBookNowRequest);

// ============================================
// CONTACT US
// ============================================
router.post("/contact-us", formsController.submitContactUs);
router.get("/contact-us", formsController.getContactInquiries);
router.put("/contact-us/:id", formsController.updateContactInquiry);
router.delete("/contact-us/:id", formsController.deleteContactInquiry);

// ============================================
// CORPORATE WELLNESS
// ============================================
router.post("/corporate-wellness", formsController.submitCorporateWellness);
router.get("/corporate-wellness", formsController.getCorporateWellnessInquiries);
router.put("/corporate-wellness/:id", formsController.updateCorporateWellnessInquiry);
router.delete("/corporate-wellness/:id", formsController.deleteCorporateWellnessInquiry);

// ============================================
// PARTNER WITH US
// ============================================
router.post("/partner-with-us", formsController.submitPartnerWithUs);
router.get("/partner-with-us", formsController.getPartnershipInquiries);
router.put("/partner-with-us/:id", formsController.updatePartnerWithUsInquiry);
router.delete("/partner-with-us/:id", formsController.deletePartnerWithUsInquiry);

// ============================================
// DOCTOR ONBOARDING
// ============================================
router.post("/doctor-onboarding", formsController.submitDoctorOnboarding);
router.get("/doctor-onboarding", formsController.getDoctorApplications);
router.put("/doctor-onboarding/:id", formsController.updateDoctorApplication);
router.delete("/doctor-onboarding/:id", formsController.deleteDoctorApplicationRequest);

// ============================================
// INSURANCE PARTNER
// ============================================
router.post("/insurance-partner", formsController.submitInsurancePartner);
router.get("/insurance-partner", formsController.getInsurancePartnerInquiries);
router.put("/insurance-partner/:id", formsController.updateInsurancePartnerInquiry);
router.delete("/insurance-partner/:id", formsController.deleteInsurancePartnerInquiry);

// ============================================
// ANALYTICS
// ============================================
router.get("/analytics/stats", formsController.getFormSubmissionStats);

export default router;
