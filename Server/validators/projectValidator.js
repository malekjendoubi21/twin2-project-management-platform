const Joi = require('joi');

const projectValidator = {
    createProject: Joi.object({
        project_name: Joi.string()
            .required()
            .min(3)
            .max(100)
            .trim()
            .messages({
                'string.empty': 'Project name cannot be empty',
                'string.min': 'Project name must be at least 3 characters long',
                'string.max': 'Project name cannot exceed 100 characters',
                'any.required': 'Project name is required'
            }),

        status: Joi.string()
            .valid('not started', 'in progress', 'completed')
            .default('not started')
            .messages({
                'any.only': 'Status must be one of: not started, in progress, completed'
            }),

        start_date: Joi.date()
            .required()
            .min('now')
            .messages({
                'date.base': 'Start date must be a valid date',
                'date.min': 'Start date cannot be before today',
                'any.required': 'Start date is required'
            }),

        end_date: Joi.date()
            .required()
            .min(Joi.ref('start_date'))
            .messages({
                'date.base': 'End date must be a valid date',
                'date.min': 'End date must be after start date',
                'any.required': 'End date is required'
            }),

        id_teamMembre: Joi.array()
            .items(
                Joi.string()
                    .regex(/^[0-9a-fA-F]{24}$/)
                    .messages({
                        'string.pattern.base': 'Invalid team member ID format'
                    })
            )
            .default([])
            .messages({
                'array.base': 'Team members must be an array'
            }),

        id_tasks: Joi.array()
            .items(
                Joi.string()
                    .regex(/^[0-9a-fA-F]{24}$/)
                    .messages({
                        'string.pattern.base': 'Invalid task ID format'
                    })
            )
            .default([])
            .messages({
                'array.base': 'Tasks must be an array'
            })
    }),

    updateProject: Joi.object({
        project_name: Joi.string()
            .min(3)
            .max(100)
            .trim()
            .messages({
                'string.min': 'Project name must be at least 3 characters long',
                'string.max': 'Project name cannot exceed 100 characters'
            }),

        status: Joi.string()
            .valid('not started', 'in progress', 'completed')
            .messages({
                'any.only': 'Status must be one of: not started, in progress, completed'
            }),

        start_date: Joi.date()
            .min('now')
            .messages({
                'date.base': 'Start date must be a valid date',
                'date.min': 'Start date cannot be before today'
            }),

        end_date: Joi.date()
            .min(Joi.ref('start_date'))
            .messages({
                'date.base': 'End date must be a valid date',
                'date.min': 'End date must be after start date'
            }),

        id_teamMembre: Joi.array()
            .items(
                Joi.string()
                    .regex(/^[0-9a-fA-F]{24}$/)
                    .messages({
                        'string.pattern.base': 'Invalid team member ID format'
                    })
            )
            .messages({
                'array.base': 'Team members must be an array'
            }),

        id_tasks: Joi.array()
            .items(
                Joi.string()
                    .regex(/^[0-9a-fA-F]{24}$/)
                    .messages({
                        'string.pattern.base': 'Invalid task ID format'
                    })
            )
            .messages({
                'array.base': 'Tasks must be an array'
            })
    }),

    addTeamMember: Joi.object({
        userId: Joi.string()
            .required()
            .regex(/^[0-9a-fA-F]{24}$/)
            .messages({
                'string.pattern.base': 'Invalid user ID format',
                'any.required': 'User ID is required'
            })
    }),

    validateId: Joi.object({
        id: Joi.string()
            .required()
            .regex(/^[0-9a-fA-F]{24}$/)
            .messages({
                'string.pattern.base': 'Invalid ID format',
                'any.required': 'ID is required'
            })
    })
};

module.exports = projectValidator; 