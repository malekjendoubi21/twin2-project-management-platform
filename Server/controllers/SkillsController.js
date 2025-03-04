const Skill = require('../models/Skills');
const { validateSkill } = require('../validators/SkillsValidators');

// Obtenir toutes les compétences
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (err) {
    console.error('Error fetching all skills:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Obtenir une compétence par son ID
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.status(200).json(skill);
  } catch (err) {
    console.error('Error fetching skill by ID:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Ajouter une nouvelle compétence
exports.createSkill = async (req, res) => {
  const { error } = validateSkill(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }
  
  try {
    const newSkill = new Skill(req.body);
    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (err) {
    console.error('Error creating skill:', err);
    res.status(400).json({ message: 'Failed to create skill', error: err });
  }
};

// Mettre à jour une compétence par son ID
exports.updateSkill = async (req, res) => {
  const { error } = validateSkill(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }

  try {
    const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSkill) return res.status(404).json({ message: 'Skill not found' });
    res.status(200).json(updatedSkill);
  } catch (err) {
    console.error('Error updating skill:', err);
    res.status(500).json({ message: 'Failed to update skill', error: err });
  }
};

// Supprimer une compétence par son ID
exports.deleteSkill = async (req, res) => {
  try {
    const deletedSkill = await Skill.findByIdAndDelete(req.params.id);
    if (!deletedSkill) return res.status(404).json({ message: 'Skill not found' });
    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (err) {
    console.error('Error deleting skill:', err);
    res.status(500).json({ message: 'Failed to delete skill', error: err });
  }
};
