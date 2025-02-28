const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/TaskController');
//const { authenticateToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
//router.use(authenticateToken);

// Create a new task
router.post('/addTask', TaskController.createTask);

// Get all tasks
router.get('/', TaskController.getAllTasks);

// Get tasks by project ID
router.get('/project/:projectId', TaskController.getTasksByProject);

// Get tasks assigned to a specific user
router.get('/user/:userId', TaskController.getUserTasks);

// Get a single task by ID
router.get('/:taskId', TaskController.getTaskById);

// Update a task
router.put('/:taskId', TaskController.updateTask);

// Update task status
router.patch('/:taskId/status', TaskController.updateTaskStatus);

// Delete a task
router.delete('/:taskId', TaskController.deleteTask);

module.exports = router; 