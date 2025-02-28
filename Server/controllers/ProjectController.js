const Project = require('../models/Project');
const projectValidator = require('../validators/projectValidator');

const ProjectController = {
    createProject: async (req, res) => {
        try {
            const { error } = projectValidator.createProject.validate(req.body, { abortEarly: false });
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

            const projectData = req.body;
            const project = new Project(projectData);
            await project.save();

            res.status(201).json({
                success: true,
                data: project,
                message: 'Project created successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    getAllProjects: async (req, res) => {
        try {
            const projects = await Project.find()
                .populate('created_by', 'name email')
                .populate('team_members', 'name email')
                .populate('tasks');

            res.status(200).json({
                success: true,
                data: projects
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getProjectById: async (req, res) => {
        try {
            const { projectId } = req.params;
            const project = await Project.findById(projectId)
                .populate('created_by', 'name email')
                .populate('team_members', 'name email')
                .populate('tasks');

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            res.status(200).json({
                success: true,
                data: project
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    updateProject: async (req, res) => {
        try {
            const { error } = projectValidator.updateProject.validate(req.body, { abortEarly: false });
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

            const { projectId } = req.params;
            const updates = req.body;

            const project = await Project.findByIdAndUpdate(
                projectId,
                updates,
                { new: true, runValidators: true }
            )
            .populate('created_by', 'name email')
            .populate('team_members', 'name email')
            .populate('tasks');

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            res.status(200).json({
                success: true,
                data: project,
                message: 'Project updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    deleteProject: async (req, res) => {
        try {
            const { projectId } = req.params;
            const project = await Project.findByIdAndDelete(projectId);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Project deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    addTeamMember: async (req, res) => {
        try {
            const { projectId } = req.params;
            const { userId } = req.body;

            const project = await Project.findByIdAndUpdate(
                projectId,
                { $addToSet: { team_members: userId } },
                { new: true }
            )
            .populate('team_members', 'name email');

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            res.status(200).json({
                success: true,
                data: project,
                message: 'Team member added successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    removeTeamMember: async (req, res) => {
        try {
            const { projectId, userId } = req.params;

            const project = await Project.findByIdAndUpdate(
                projectId,
                { $pull: { team_members: userId } },
                { new: true }
            )
            .populate('team_members', 'name email');

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            res.status(200).json({
                success: true,
                data: project,
                message: 'Team member removed successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = ProjectController; 