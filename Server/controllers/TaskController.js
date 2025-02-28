const Task = require('../models/Task');
const taskValidator = require('../validators/taskValidator');

const TaskController = {
    // Create a new task
    createTask: async (req, res) => {
        try {
            // Validate request body
            const { error } = taskValidator.createTask.validate(req.body, { abortEarly: false });
            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path[0],
                    message: detail.message
                }));
                return res.status(400).json({
                    success: false,
                    errors: errors
                });
            }

            const taskData = req.body;
            const task = new Task(taskData);
            await task.save();
            
            res.status(201).json({
                success: true,
                data: task,
                message: 'Task created successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get all tasks
    getAllTasks: async (req, res) => {
        try {
            const tasks = await Task.find()
                .populate('assigned_to', 'name email')
                .populate('project_id', 'name');

            res.status(200).json({
                success: true,
                data: tasks
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get tasks by project ID
    
    getTasksByProject: async (req, res) => {
        try {
            const { projectId } = req.params;
            const tasks = await Task.find({ project_id: projectId })
                .populate('assigned_to', 'name email')
                .populate('project_id', 'name');

            res.status(200).json({
                success: true,
                data: tasks
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get tasks assigned to a specific user
    getUserTasks: async (req, res) => {
        try {
            const { userId } = req.params;
            const tasks = await Task.find({ assigned_to: userId })
                .populate('project_id', 'name')
                .populate('assigned_to', 'name email');

            res.status(200).json({
                success: true,
                data: tasks
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get a single task by ID
    getTaskById: async (req, res) => {
        try {
            const { taskId } = req.params;
            const task = await Task.findById(taskId)
                .populate('assigned_to', 'name email')
                .populate('project_id', 'name');

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Update a task
    updateTask: async (req, res) => {
        try {
            // Validate request body
            const { error } = taskValidator.updateTask.validate(req.body, { abortEarly: false });
            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path[0],
                    message: detail.message
                }));
                return res.status(400).json({
                    success: false,
                    errors: errors
                });
            }

            const { taskId } = req.params;
            const updates = req.body;

            const task = await Task.findByIdAndUpdate(
                taskId,
                updates,
                { new: true, runValidators: true }
            ).populate('assigned_to', 'name email')
             .populate('project_id', 'name');

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            res.status(200).json({
                success: true,
                data: task,
                message: 'Task updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Update task status
    updateTaskStatus: async (req, res) => {
        try {
            // Validate request body
            const { error } = taskValidator.updateStatus.validate(req.body, { abortEarly: false });
            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path[0],
                    message: detail.message
                }));
                return res.status(400).json({
                    success: false,
                    errors: errors
                });
            }

            const { taskId } = req.params;
            const { status } = req.body;

            const task = await Task.findByIdAndUpdate(
                taskId,
                { status },
                { new: true, runValidators: true }
            ).populate('assigned_to', 'name email')
             .populate('project_id', 'name');

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            res.status(200).json({
                success: true,
                data: task,
                message: 'Task status updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Delete a task
    deleteTask: async (req, res) => {
        try {
            const { taskId } = req.params;
            const task = await Task.findByIdAndDelete(taskId);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Task deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = TaskController; 