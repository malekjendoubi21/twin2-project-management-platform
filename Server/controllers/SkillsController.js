const Skill = require('../models/Skills');
const { validateSkill } = require('../validators/SkillsValidators');

// Obtenir toutes les compétences
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (err) {
    console.error('Error fetching all skills:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Obtenir une compétence par son ID
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.status(200).json(skill);
  } catch (err) {
    console.error('Error fetching skill by ID:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Ajouter une nouvelle compétence
exports.createSkill = async (req, res) => {
  const { error } = validateSkill(req.body);
  if (error) {
    console.log('Validation errors:', error.details);
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }

  try {
    console.log('Creating skill with data:', req.body);
    const newSkill = new Skill(req.body);
    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (err) {
    console.error('Error creating skill:', err.message);
    res.status(400).json({ message: 'Failed to create skill', error: err.message });
  }
};

// Mettre à jour une compétence par son ID
exports.updateSkill = async (req, res) => {
  const { error } = validateSkill(req.body);
  if (error) {
    console.log('Validation errors:', error.details);
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }

  try {
    console.log('Updating skill with ID:', req.params.id, 'Data:', req.body);
    const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSkill) return res.status(404).json({ message: 'Skill not found' });
    res.status(200).json(updatedSkill);
  } catch (err) {
    console.error('Error updating skill:', err.message);
    res.status(500).json({ message: 'Failed to update skill', error: err.message });
  }
};

// Supprimer une compétence par son ID
exports.deleteSkill = async (req, res) => {
  try {
    const deletedSkill = await Skill.findByIdAndDelete(req.params.id);
    if (!deletedSkill) return res.status(404).json({ message: 'Skill not found' });
    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (err) {
    console.error('Error deleting skill:', err.message);
    res.status(500).json({ message: 'Failed to delete skill', error: err.message });
  }
};