const Experience = require('../models/Experience');
const { validateExperience } = require('../validators/experienceValidator');

// Créer une nouvelle expérience
exports.createExperience = async (req, res) => {
  const { error } = validateExperience(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }

  try {
    const newExperience = new Experience(req.body);
    await newExperience.save();
    res.status(201).json(newExperience);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create experience', error: err });
  }
};

// Récupérer toutes les expériences
exports.getAllExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find();
    res.status(200).json(experiences);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Récupérer une expérience par ID
exports.getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) return res.status(404).json({ message: 'Experience not found' });
    res.status(200).json(experience);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Mettre à jour une expérience
exports.updateExperience = async (req, res) => {
  const { error } = validateExperience(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }

  try {
    const updatedExperience = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedExperience) return res.status(404).json({ message: 'Experience not found' });
    res.status(200).json(updatedExperience);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update experience', error: err });
  }
};

// Supprimer une expérience
exports.deleteExperience = async (req, res) => {
  try {
    const deletedExperience = await Experience.findByIdAndDelete(req.params.id);
    if (!deletedExperience) return res.status(404).json({ message: 'Experience not found' });
    res.status(200).json({ message: 'Experience deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete experience', error: err });
  }
};
