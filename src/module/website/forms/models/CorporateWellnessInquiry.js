const mongoose = require('mongoose');

const corporateWellnessSchema = new mongoose.Schema({
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
  employeeCount: {
    type: String,
    required: true,
    enum: ['1-50', '51-200', '201-1000', '1000+']
  },
  industry: {
    type: String,
    required: true,
    enum: ['IT/Software', 'Healthcare', 'Manufacturing', 'Finance', 'Retail', 'Education', 'Other']
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
    default: 'corporate-wellness-form'
  }
});

module.exports = mongoose.model('CorporateWellnessInquiry', corporateWellnessSchema);
