const mongoose = require('mongoose');

const doctorApplicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  specialty: {
    type: String,
    required: true
  },
  subSpecialty: {
    type: String
  },
  medicalLicense: {
    type: String,
    required: true
  },
  years_of_experience: {
    type: Number,
    required: true
  },
  qualifications: {
    type: String,
    required: true
  },
  hospital_affiliation: {
    type: String
  },
  cv: {
    type: String
  },
  status: {
    type: String,
    enum: ['new', 'reviewing', 'approved', 'rejected'],
    default: 'new'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String
  },
  approvalDate: {
    type: Date
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'doctor-onboarding-form'
  }
});

module.exports = mongoose.model('DoctorApplication', doctorApplicationSchema);
