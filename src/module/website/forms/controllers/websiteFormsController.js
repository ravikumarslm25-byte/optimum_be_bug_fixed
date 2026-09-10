const ContactSubmission = require('../models/ContactSubmission');
const CorporateWellnessInquiry = require('../models/CorporateWellnessInquiry');
const InsurancePartnerInquiry = require('../models/InsurancePartnerInquiry');
const DoctorApplication = require('../models/DoctorApplication');
const PartnershipInquiry = require('../models/PartnershipInquiry');

// ============ CONTACT FORM CONTROLLERS ============

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const submission = new ContactSubmission({
      name,
      email,
      phone,
      subject,
      message,
      submitted_at: new Date()
    });

    await submission.save();

    console.log('New contact form submission:', submission);

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: submission
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
};

exports.getContactSubmissions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const submissions = await ContactSubmission.find(filter).sort({ submitted_at: -1 });

    res.json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions',
      error: error.message
    });
  }
};

exports.updateContactSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: submission
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission',
      error: error.message
    });
  }
};

exports.deleteContactSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await ContactSubmission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission',
      error: error.message
    });
  }
};

// ============ CORPORATE WELLNESS CONTROLLERS ============

exports.submitCorporateWellness = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, employeeCount, industry, message } = req.body;

    if (!companyName || !contactPerson || !email || !phone || !employeeCount || !industry) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const inquiry = new CorporateWellnessInquiry({
      companyName,
      contactPerson,
      email,
      phone,
      employeeCount,
      industry,
      message,
      submitted_at: new Date()
    });

    await inquiry.save();

    console.log('New corporate wellness inquiry:', inquiry);

    res.status(201).json({
      success: true,
      message: 'Corporate wellness inquiry received',
      data: inquiry
    });
  } catch (error) {
    console.error('Corporate wellness submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit corporate wellness inquiry',
      error: error.message
    });
  }
};

exports.getCorporateWellnessInquiries = async (req, res) => {
  try {
    const { status, industry } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (industry) filter.industry = industry;

    const inquiries = await CorporateWellnessInquiry.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ submitted_at: -1 });

    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    console.error('Get corporate wellness inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

exports.updateCorporateWellness = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedTo, followUp } = req.body;

    const inquiry = await CorporateWellnessInquiry.findByIdAndUpdate(
      id,
      { status, notes, assignedTo, followUp },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Inquiry updated successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry',
      error: error.message
    });
  }
};

exports.deleteCorporateWellness = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await CorporateWellnessInquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry',
      error: error.message
    });
  }
};

// ============ INSURANCE PARTNER CONTROLLERS ============

exports.submitInsurancePartner = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, companyType, coverage, message } = req.body;

    if (!companyName || !contactPerson || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const inquiry = new InsurancePartnerInquiry({
      companyName,
      contactPerson,
      email,
      phone,
      companyType,
      coverage,
      message,
      submitted_at: new Date()
    });

    await inquiry.save();

    console.log('New insurance partner inquiry:', inquiry);

    res.status(201).json({
      success: true,
      message: 'Insurance partner inquiry received',
      data: inquiry
    });
  } catch (error) {
    console.error('Insurance partner submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit insurance partner inquiry',
      error: error.message
    });
  }
};

exports.getInsurancePartnerInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const inquiries = await InsurancePartnerInquiry.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ submitted_at: -1 });

    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    console.error('Get insurance partner inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

exports.updateInsurancePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedTo, followUp } = req.body;

    const inquiry = await InsurancePartnerInquiry.findByIdAndUpdate(
      id,
      { status, notes, assignedTo, followUp },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Inquiry updated successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry',
      error: error.message
    });
  }
};

exports.deleteInsurancePartner = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await InsurancePartnerInquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry',
      error: error.message
    });
  }
};

// ============ DOCTOR APPLICATION CONTROLLERS ============

exports.submitDoctorApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      specialty,
      subSpecialty,
      medicalLicense,
      years_of_experience,
      qualifications,
      hospital_affiliation,
      cv
    } = req.body;

    if (!fullName || !email || !phone || !dateOfBirth || !gender || !specialty || !medicalLicense || !years_of_experience || !qualifications) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const application = new DoctorApplication({
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      specialty,
      subSpecialty,
      medicalLicense,
      years_of_experience,
      qualifications,
      hospital_affiliation,
      cv,
      submitted_at: new Date()
    });

    await application.save();

    console.log('New doctor application:', application);

    res.status(201).json({
      success: true,
      message: 'Doctor application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Doctor application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit doctor application',
      error: error.message
    });
  }
};

exports.getDoctorApplications = async (req, res) => {
  try {
    const { status, specialty } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (specialty) filter.specialty = specialty;

    const applications = await DoctorApplication.find(filter)
      .populate('reviewedBy', 'name email')
      .sort({ submitted_at: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get doctor applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

exports.updateDoctorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, reviewedBy, approvalDate } = req.body;

    const application = await DoctorApplication.findByIdAndUpdate(
      id,
      { status, reviewNotes, reviewedBy, approvalDate },
      { new: true }
    ).populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message
    });
  }
};

exports.deleteDoctorApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await DoctorApplication.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
};

// ============ PARTNERSHIP INQUIRY CONTROLLERS ============

exports.submitPartnershipInquiry = async (req, res) => {
  try {
    const {
      hospitalName,
      contactPerson,
      designation,
      email,
      phone,
      city,
      state,
      hospitalType,
      bedCapacity,
      specializations,
      currentPatientVolume,
      website,
      message
    } = req.body;

    if (!hospitalName || !contactPerson || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const inquiry = new PartnershipInquiry({
      hospitalName,
      contactPerson,
      designation,
      email,
      phone,
      city,
      state,
      hospitalType,
      bedCapacity,
      specializations,
      currentPatientVolume,
      website,
      message,
      submitted_at: new Date()
    });

    await inquiry.save();

    console.log('New partnership inquiry:', inquiry);

    res.status(201).json({
      success: true,
      message: 'Partnership inquiry received',
      data: inquiry
    });
  } catch (error) {
    console.error('Partnership inquiry submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit partnership inquiry',
      error: error.message
    });
  }
};

exports.getPartnershipInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const inquiries = await PartnershipInquiry.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ submitted_at: -1 });

    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    console.error('Get partnership inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

exports.updatePartnershipInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedTo, followUp } = req.body;

    const inquiry = await PartnershipInquiry.findByIdAndUpdate(
      id,
      { status, notes, assignedTo, followUp },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Inquiry updated successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry',
      error: error.message
    });
  }
};

exports.deletePartnershipInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await PartnershipInquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry',
      error: error.message
    });
  }
};
