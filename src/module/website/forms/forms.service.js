// ============================================
// FILE: src/module/website/forms/forms.service.js
// PURPOSE: Business logic for website form submissions
// ============================================

import {
  BookNowModel,
  CorporateWellnessModel,
  InsurancePartnerModel,
  PartnerWithUsModel,
  DoctorOnboardingModel,
  ContactUsModel,
} from "./forms.model.js";

class WebsiteFormService {
  // ============================================
  // BOOK NOW FORM
  // ============================================

  static async submitBookNow(data) {
    try {
      const bookNow = new BookNowModel(data);
      await bookNow.save();

      console.log("✅ Book Now form submitted:", bookNow._id);
      return {
        status: true,
        message: "Appointment request submitted successfully",
        data: bookNow,
      };
    } catch (error) {
      console.error("❌ Book Now submission error:", error);
      throw error;
    }
  }

  static async getAllBookNow(filters = {}) {
    try {
      const bookNows = await BookNowModel.find(filters).sort({
        createdAt: -1,
      });
      return bookNows;
    } catch (error) {
      throw error;
    }
  }

  static async getBookNowById(id) {
    try {
      return await BookNowModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async updateBookNow(id, data) {
    try {
      return await BookNowModel.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw error;
    }
  }

  static async deleteBookNow(id) {
    try {
      return await BookNowModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // CORPORATE WELLNESS FORM
  // ============================================

  static async submitCorporateWellness(data) {
    try {
      const wellness = new CorporateWellnessModel(data);
      await wellness.save();
      console.log("✅ Corporate Wellness form submitted:", wellness._id);
      return {
        status: true,
        message: "Corporate wellness inquiry submitted successfully",
        data: wellness,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAllCorporateWellness(filters = {}) {
    try {
      return await CorporateWellnessModel.find(filters).sort({
        createdAt: -1,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateCorporateWellness(id, data) {
    try {
      return await CorporateWellnessModel.findByIdAndUpdate(id, data, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // INSURANCE PARTNER FORM
  // ============================================

  static async submitInsurancePartner(data) {
    try {
      const insurance = new InsurancePartnerModel(data);
      await insurance.save();
      console.log("✅ Insurance Partner form submitted:", insurance._id);
      return {
        status: true,
        message: "Insurance partnership inquiry submitted successfully",
        data: insurance,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAllInsurancePartners(filters = {}) {
    try {
      return await InsurancePartnerModel.find(filters).sort({
        createdAt: -1,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateInsurancePartner(id, data) {
    try {
      return await InsurancePartnerModel.findByIdAndUpdate(id, data, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // PARTNER WITH US FORM
  // ============================================

  static async submitPartnerWithUs(data) {
    try {
      const partner = new PartnerWithUsModel(data);
      await partner.save();
      console.log("✅ Partner With Us form submitted:", partner._id);
      return {
        status: true,
        message: "Partnership inquiry submitted successfully",
        data: partner,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAllPartnerRequests(filters = {}) {
    try {
      return await PartnerWithUsModel.find(filters).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  static async updatePartnerRequest(id, data) {
    try {
      return await PartnerWithUsModel.findByIdAndUpdate(id, data, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // DOCTOR ONBOARDING FORM
  // ============================================

  static async submitDoctorOnboarding(data) {
    try {
      const doctor = new DoctorOnboardingModel(data);
      await doctor.save();
      console.log("✅ Doctor Onboarding form submitted:", doctor._id);
      return {
        status: true,
        message: "Doctor onboarding application submitted successfully",
        data: doctor,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAllDoctorApplications(filters = {}) {
    try {
      return await DoctorOnboardingModel.find(filters).sort({
        createdAt: -1,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateDoctorApplication(id, data) {
    try {
      return await DoctorOnboardingModel.findByIdAndUpdate(id, data, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteDoctorApplication(id) {
    try {
      return await DoctorOnboardingModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // CONTACT US FORM
  // ============================================

  static async submitContactUs(data) {
    try {
      const contact = new ContactUsModel(data);
      await contact.save();
      console.log("✅ Contact Us form submitted:", contact._id);
      return {
        status: true,
        message: "Your message has been received. We will contact you soon.",
        data: contact,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAllContactInquiries(filters = {}) {
    try {
      return await ContactUsModel.find(filters).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  static async updateContactInquiry(id, data) {
    try {
      return await ContactUsModel.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw error;
    }
  }

  static async deleteCorporateWellness(id) {
    try {
      return await CorporateWellnessModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  static async deleteInsurancePartner(id) {
    try {
      return await InsurancePartnerModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  static async deletePartnerRequest(id) {
    try {
      return await PartnerWithUsModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  static async deleteContactInquiry(id) {
    try {
      return await ContactUsModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // ANALYTICS & REPORTING
  // ============================================

  static async getFormSubmissionStats() {
    try {
      const stats = {
        book_now: await BookNowModel.countDocuments(),
        corporate_wellness: await CorporateWellnessModel.countDocuments(),
        insurance_partner: await InsurancePartnerModel.countDocuments(),
        partner_with_us: await PartnerWithUsModel.countDocuments(),
        doctor_onboarding: await DoctorOnboardingModel.countDocuments(),
        contact_us: await ContactUsModel.countDocuments(),
        total: 0,
      };

      stats.total =
        stats.book_now +
        stats.corporate_wellness +
        stats.insurance_partner +
        stats.partner_with_us +
        stats.doctor_onboarding +
        stats.contact_us;

      return stats;
    } catch (error) {
      throw error;
    }
  }

  static async getFormSubmissionsByDateRange(startDate, endDate) {
    try {
      const dateFilter = {
        createdAt: { $gte: startDate, $lte: endDate },
      };

      return {
        book_now: await BookNowModel.find(dateFilter),
        corporate_wellness: await CorporateWellnessModel.find(dateFilter),
        insurance_partner: await InsurancePartnerModel.find(dateFilter),
        partner_with_us: await PartnerWithUsModel.find(dateFilter),
        doctor_onboarding: await DoctorOnboardingModel.find(dateFilter),
        contact_us: await ContactUsModel.find(dateFilter),
      };
    } catch (error) {
      throw error;
    }
  }
}

export default WebsiteFormService;
