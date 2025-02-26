const Project = require('../models/Project');
const { validateProject } = require('../validators/ProjectValidator');

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('id_teamMembre').populate('id_tasks');
    res.status(200).json(projects);
  } catch (err) {
    console.error('Error fetching all projects:', err);

    res.status(500).json({ message: 'Server error', error: err });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('id_teamMembre').populate('id_tasks');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

exports.createProject = async (req, res) => {
    const { error } = validateProject(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details.map((err) => err.message) });
    }
  try {
    const newProject = await Project.create(req.body);
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create project', error: err });
  }
};

exports.updateProject = async (req, res) => {
    const { error } = validateProject(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details.map((err) => err.message) });
    }
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project', error: err });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project', error: err });
  }
};
