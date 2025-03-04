const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  certifications_name: {
    type: String,
    required: true,
    trim: true, 
  },
  issued_by: {
    type: String,
    required: true,
    trim: true, 
  },
  obtained_date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    trim: true, 
  },
  image: {
    type: String,
    default: '', 
  }
}, {
  timestamps: true, // Enregistre automatiquement les dates de création et de mise à jour
});

module.exports = mongoose.model('Certification', certificationSchema);
