const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectController');
//const { authenticateToken } = require('../middleware/authMiddleware');



// Create a new project
router.post('/createProject', ProjectController.createProject);

// Get all projects
router.get('/', ProjectController.getAllProjects);

// Get a single project by ID
router.get('/:projectId', ProjectController.getProjectById);

// Update a project
router.put('/:projectId', ProjectController.updateProject);

// Delete a project
router.delete('/:projectId', ProjectController.deleteProject);

// Add team member to project
router.post('/:projectId/team', ProjectController.addTeamMember);

// Remove team member from project
router.delete('/:projectId/team/:userId', ProjectController.removeTeamMember);

module.exports = router; 