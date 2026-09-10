const mongoose = require('mongoose');

const partnershipInquirySchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String
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
  city: {
    type: String
  },
  state: {
    type: String
  },
  hospitalType: {
    type: String
  },
  bedCapacity: {
    type: String
  },
  specializations: {
    type: String
  },
  currentPatientVolume: {
    type: String
  },
  website: {
    type: String
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-discussion', 'won', 'lost'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  followUp: {
    type: Date
  },
  notes: {
    type: String
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'partnership-form'
  }
});

module.exports = mongoose.model('PartnershipInquiry', partnershipInquirySchema);
