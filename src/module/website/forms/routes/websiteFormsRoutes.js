const express = require('express');
const router = express.Router();
const formsController = require('../controllers/websiteFormsController');

// Contact Form Routes
router.post('/contact-us', formsController.submitContactForm);
router.get('/contact-us', formsController.getContactSubmissions);
router.patch('/contact-us/:id', formsController.updateContactSubmission);
router.delete('/contact-us/:id', formsController.deleteContactSubmission);

// Corporate Wellness Routes
router.post('/corporate-wellness-inquiry', formsController.submitCorporateWellness);
router.get('/corporate-wellness-inquiry', formsController.getCorporateWellnessInquiries);
router.patch('/corporate-wellness-inquiry/:id', formsController.updateCorporateWellness);
router.delete('/corporate-wellness-inquiry/:id', formsController.deleteCorporateWellness);

// Insurance Partner Routes
router.post('/insurance-partner-inquiry', formsController.submitInsurancePartner);
router.get('/insurance-partner-inquiry', formsController.getInsurancePartnerInquiries);
router.patch('/insurance-partner-inquiry/:id', formsController.updateInsurancePartner);
router.delete('/insurance-partner-inquiry/:id', formsController.deleteInsurancePartner);

// Doctor Onboarding Routes
router.post('/doctor-onboarding-application', formsController.submitDoctorApplication);
router.get('/doctor-onboarding-application', formsController.getDoctorApplications);
router.patch('/doctor-onboarding-application/:id', formsController.updateDoctorApplication);
router.delete('/doctor-onboarding-application/:id', formsController.deleteDoctorApplication);

// Partnership Routes
router.post('/partnership-inquiry', formsController.submitPartnershipInquiry);
router.get('/partnership-inquiry', formsController.getPartnershipInquiries);
router.patch('/partnership-inquiry/:id', formsController.updatePartnershipInquiry);
router.delete('/partnership-inquiry/:id', formsController.deletePartnershipInquiry);

module.exports = router;
