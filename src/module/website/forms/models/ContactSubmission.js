const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  name: {
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
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'in-progress', 'resolved'],
    default: 'new'
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
    default: 'contact-form'
  }
});

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);
