const Workspace = require('../models/Workspace');
const { validateWorkspace } = require('../validators/WorkspaceValidator');

// Create a new workspace
exports.addWorkspace = async (req, res) => {
  const { error } = validateWorkspace(req.body);
  if (error) return res.status(400).json({ errors: error.details.map(err => err.message) });

  try {
    const newWorkspace = new Workspace(req.body);
    const savedWorkspace = await newWorkspace.save();
    res.status(201).json(savedWorkspace);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all workspaces
exports.getAllWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find().populate('owner members.user projects');
    res.status(200).json(workspaces);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single workspace by ID
exports.getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id).populate('owner members.user projects');
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    res.status(200).json(workspace);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a workspace
exports.updateWorkspace = async (req, res) => {
  const { error } = validateWorkspace(req.body);
  if (error) return res.status(400).json({ errors: error.details.map(err => err.message) });

  try {
    const updatedWorkspace = await Workspace.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('owner members.user projects');
    if (!updatedWorkspace) return res.status(404).json({ message: 'Workspace not found' });
    res.status(200).json(updatedWorkspace);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a workspace
exports.deleteWorkspace = async (req, res) => {
  try {
    const deletedWorkspace = await Workspace.findByIdAndDelete(req.params.id);
    if (!deletedWorkspace) return res.status(404).json({ message: 'Workspace not found' });
    res.status(200).json({ message: 'Workspace deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
