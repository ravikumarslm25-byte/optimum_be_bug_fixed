const mongoose = require('mongoose');

const insurancePartnerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
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
  companyType: {
    type: String
  },
  coverage: {
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
    default: 'insurance-partner-form'
  }
});

module.exports = mongoose.model('InsurancePartnerInquiry', insurancePartnerSchema);
