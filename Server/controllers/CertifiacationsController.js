const Certification = require('../models/Certifications');
const { validateCertification } = require('../validators/CertificationsValidators');

// Récupérer toutes les certifications
exports.getAllCertifications = async (req, res) => {
  try {
    const certifications = await Certification.find();
    res.status(200).json(certifications);
  } catch (err) {
    console.error('Error fetching all certifications:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Récupérer une certification par son ID
exports.getCertificationById = async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);
    if (!certification) return res.status(404).json({ message: 'Certification not found' });
    res.status(200).json(certification);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Créer une nouvelle certification
exports.createCertification = async (req, res) => {
  const { error } = validateCertification(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }

  try {
    const newCertification = await Certification.create(req.body);
    res.status(201).json(newCertification);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create certification', error: err });
  }
};

// Mettre à jour une certification existante
exports.updateCertification = async (req, res) => {
  const { error } = validateCertification(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }

  try {
    const updatedCertification = await Certification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCertification) return res.status(404).json({ message: 'Certification not found' });
    res.status(200).json(updatedCertification);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update certification', error: err });
  }
};

// Supprimer une certification
exports.deleteCertification = async (req, res) => {
  try {
    const deletedCertification = await Certification.findByIdAndDelete(req.params.id);
    if (!deletedCertification) return res.status(404).json({ message: 'Certification not found' });
    res.status(200).json({ message: 'Certification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete certification', error: err });
  }
};

