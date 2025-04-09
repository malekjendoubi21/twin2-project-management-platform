const Experience = require('../models/Experience');
const { validateExperience } = require('../validators/experienceValidator');

// Créer une nouvelle expérience
exports.createExperience = async (req, res) => {
  console.log('Requête reçue, en-têtes :', req.headers);
  console.log('Données reçues dans req.body :', req.body);

  const { error } = validateExperience(req.body);
  if (error) {
    console.log('Validation errors:', error.details);
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }

  if (!req.user || !req.user._id) {
    console.log('Utilisateur non authentifié, req.user :', req.user);
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    console.log('Creating experience with data:', req.body, 'for userId:', req.user._id);
    const newExperience = new Experience({
      ...req.body,
      userId: req.user._id
    });
    await newExperience.save();
    res.status(201).json(newExperience);
  } catch (err) {
    console.error('Error creating experience:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to create experience', error: err.message });
  }
};

// Récupérer toutes les expériences
exports.getAllExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find();
    res.status(200).json(experiences);
  } catch (err) {
    console.error('Error fetching all experiences:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Récupérer toutes les expériences de l'utilisateur connecté
exports.getUserExperiences = async (req, res) => {
  console.log('Request received, headers:', req.headers);
  console.log('Request user:', req.user);

  if (!req.user || !req.user._id) {
    console.log('User not authenticated, req.user:', req.user, 'Headers:', req.headers);
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const experiences = await Experience.find({ userId: req.user._id });
    console.log('Found experiences for userId:', req.user._id, experiences);
    if (!experiences.length) {
      return res.status(200).json({ message: 'No experiences found for this user', experiences: [] });
    }
    res.status(200).json(experiences);
  } catch (err) {
    console.error('Error fetching user experiences:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Récupérer une expérience par ID
exports.getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findOne({ _id: req.params.id, userId: req.user._id });
    if (!experience) return res.status(404).json({ message: 'Experience not found or unauthorized' });
    res.status(200).json(experience);
  } catch (err) {
    console.error('Error fetching experience by ID:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mettre à jour une expérience
exports.updateExperience = async (req, res) => {
  const { error } = validateExperience(req.body);
  if (error) {
    console.log('Validation errors:', error.details);
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }

  try {
    console.log('Updating experience with ID:', req.params.id, 'Data:', req.body);
    const experience = await Experience.findOne({ _id: req.params.id, userId: req.user._id });
    if (!experience) return res.status(404).json({ message: 'Experience not found or unauthorized' });

    const updatedExperience = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedExperience);
  } catch (err) {
    console.error('Error updating experience:', err.message);
    res.status(500).json({ message: 'Failed to update experience', error: err.message });
  }
};

// Supprimer une expérience
exports.deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findOne({ _id: req.params.id, userId: req.user._id });
    if (!experience) return res.status(404).json({ message: 'Experience not found or unauthorized' });

    const deletedExperience = await Experience.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Experience deleted successfully' });
  } catch (err) {
    console.error('Error deleting experience:', err.message);
    res.status(500).json({ message: 'Failed to delete experience', error: err.message });
  }
};