// ============================================
// FILE: src/module/website/forms/forms.model.js
// PURPOSE: Store all website form submissions.
// Field names mirror the approved website forms EXACTLY (camelCase),
// so every field a visitor fills is captured 1:1. CRM-only workflow
// fields (status / assigned_to / notes / source) are added on top.
// ============================================

import mongoose from "mongoose";

// Shared CRM workflow fields appended to every form
const workflowFields = (statusEnum, defaultSource) => ({
  source: { type: String, default: defaultSource },
  status: { type: String, enum: statusEnum, default: "new" },
  assigned_to: { type: String, default: "" }, // Employee name / id
  notes: { type: String, default: "" },
});

// ============================================
// 1) BOOK NOW (Home page AppointmentForm)
//    Website fields: name, phone, email, date, department
// ============================================
const bookNowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, default: "" }, // stored as submitted (yyyy-mm-dd)
    department: { type: String, default: "" },
    ...workflowFields(
      ["new", "contacted", "confirmed", "completed", "cancelled"],
      "website_book_now"
    ),
  },
  { timestamps: true }
);

// ============================================
// 2) CONTACT US
//    Website fields: name, email, phone, subject, message
// ============================================
const contactUsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, default: "" },
    ...workflowFields(
      ["new", "read", "replied", "resolved"],
      "website_contact_us"
    ),
  },
  { timestamps: true }
);

// ============================================
// 3) CORPORATE WELLNESS
//    Website fields: companyName, contactPerson, email, phone,
//                    employeeCount, industry, message
// ============================================
const corporateWellnessSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    employeeCount: { type: String, default: "" },
    industry: { type: String, default: "" },
    message: { type: String, default: "" },
    ...workflowFields(
      ["new", "contacted", "proposal_sent", "negotiating", "closed"],
      "website_corporate_wellness"
    ),
  },
  { timestamps: true }
);

// ============================================
// 4) PARTNER WITH US (Hospital partnership)
//    Website fields: hospitalName, contactPerson, designation, email,
//                    phone, city, state, hospitalType, bedCapacity,
//                    specializations, currentPatientVolume, website, message
// ============================================
const partnerWithUsSchema = new mongoose.Schema(
  {
    hospitalName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    designation: { type: String, default: "" },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    hospitalType: { type: String, default: "" },
    bedCapacity: { type: String, default: "" },
    specializations: { type: String, default: "" },
    currentPatientVolume: { type: String, default: "" },
    website: { type: String, default: "" },
    message: { type: String, default: "" },
    ...workflowFields(
      ["new", "reviewed", "interested", "negotiating", "partnered"],
      "website_partner_with_us"
    ),
  },
  { timestamps: true }
);

// ============================================
// 5) DOCTOR ONBOARDING
//    Website fields: fullName, email, phone, dateOfBirth, gender,
//      specialty, subSpecialty, qualification, medicalRegistrationNumber,
//      yearOfRegistration, experience, currentHospital, city, state,
//      consultationFee, preferredLanguages, availability, servicesOffered,
//      achievements, linkedinProfile, message
// ============================================
const doctorOnboardingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: String, default: "" },
    gender: { type: String, default: "" },
    specialty: { type: String, default: "" },
    subSpecialty: { type: String, default: "" },
    qualification: { type: String, default: "" },
    medicalRegistrationNumber: { type: String, default: "" },
    yearOfRegistration: { type: String, default: "" },
    experience: { type: String, default: "" },
    currentHospital: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    consultationFee: { type: String, default: "" },
    preferredLanguages: { type: String, default: "" },
    availability: { type: String, default: "" },
    servicesOffered: { type: String, default: "" },
    achievements: { type: String, default: "" },
    linkedinProfile: { type: String, default: "" },
    message: { type: String, default: "" },
    ...workflowFields(
      ["new", "documents_review", "interview_pending", "approved", "rejected"],
      "website_doctor_onboarding"
    ),
  },
  { timestamps: true }
);

// ============================================
// 6) INSURANCE PARTNER
//    Website fields: companyName, contactPerson, email, phone,
//                    companyType, coverage, message
// ============================================
const insurancePartnerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    companyType: { type: String, default: "" },
    coverage: { type: String, default: "" },
    message: { type: String, default: "" },
    ...workflowFields(
      ["new", "contacted", "discussing", "partnered"],
      "website_insurance_partner"
    ),
  },
  { timestamps: true }
);

// ============================================
// MODELS (names unchanged → same collections)
// ============================================
const BookNowModel = mongoose.model("WebsiteBookNow", bookNowSchema);
const ContactUsModel = mongoose.model("WebsiteContactUs", contactUsSchema);
const CorporateWellnessModel = mongoose.model(
  "WebsiteCorporateWellness",
  corporateWellnessSchema
);
const PartnerWithUsModel = mongoose.model(
  "WebsitePartnerWithUs",
  partnerWithUsSchema
);
const DoctorOnboardingModel = mongoose.model(
  "WebsiteDoctorOnboarding",
  doctorOnboardingSchema
);
const InsurancePartnerModel = mongoose.model(
  "WebsiteInsurancePartner",
  insurancePartnerSchema
);

export {
  BookNowModel,
  ContactUsModel,
  CorporateWellnessModel,
  PartnerWithUsModel,
  DoctorOnboardingModel,
  InsurancePartnerModel,
};
