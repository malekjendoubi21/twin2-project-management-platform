const Joi = require('joi');

const projectValidator = {
    createProject: Joi.object({
        name: Joi.string()
            .required()
            .min(3)
            .max(100)
            .trim()
            .messages({
                'string.min': 'Project name must be at least 3 characters long',
                'string.max': 'Project name cannot exceed 100 characters',
                'any.required': 'Project name is required'
            }),

        description: Joi.string()
            .required()
            .min(10)
            .max(1000)
            .trim()
            .messages({
                'string.min': 'Description must be at least 10 characters long',
                'string.max': 'Description cannot exceed 1000 characters',
                'any.required': 'Description is required'
            }),

        status: Joi.string()
            .valid('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED')
            .default('PLANNING')
            .messages({
                'any.only': 'Status must be one of: PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED'
            }),

        start_date: Joi.date()
            .required()
            .messages({
                'any.required': 'Start date is required'
            }),

        end_date: Joi.date()
            .required()
            .min(Joi.ref('start_date'))
            .messages({
                'any.required': 'End date is required',
                'date.min': 'End date must be after start date'
            }),

        team_members: Joi.array()
            .items(Joi.string())
            .default([])
            .messages({
                'array.base': 'Team members must be an array'
            }),

        created_by: Joi.string()
            .required()
            .messages({
                'any.required': 'Created by user ID is required'
            })
    }),

    updateProject: Joi.object({
        name: Joi.string()
            .min(3)
            .max(100)
            .trim()
            .messages({
                'string.min': 'Project name must be at least 3 characters long',
                'string.max': 'Project name cannot exceed 100 characters'
            }),

        description: Joi.string()
            .min(10)
            .max(1000)
            .trim()
            .messages({
                'string.min': 'Description must be at least 10 characters long',
                'string.max': 'Description cannot exceed 1000 characters'
            }),

        status: Joi.string()
            .valid('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED')
            .messages({
                'any.only': 'Status must be one of: PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED'
            }),

        start_date: Joi.date(),
        end_date: Joi.date()
            .min(Joi.ref('start_date'))
            .messages({
                'date.min': 'End date must be after start date'
            }),

        team_members: Joi.array()
            .items(Joi.string())
            .messages({
                'array.base': 'Team members must be an array'
            })
    })
};

module.exports = projectValidator; 