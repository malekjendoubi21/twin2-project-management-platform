const Joi = require('joi');

const experienceSchema = Joi.object({
  job_title: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Job title cannot be empty',
      'any.required': 'Job title is required',
    }),

  company: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Company name cannot be empty',
      'any.required': 'Company name is required',
    }),

  start_date: Joi.date()
    .required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required',
    }),

  end_date: Joi.date()
    .min(Joi.ref('start_date'))
    .required()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required',
    }),

  description: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Description cannot be empty',
      'any.required': 'Description is required',
    }),
});

module.exports = {
  validateExperience: (data) => experienceSchema.validate(data, { abortEarly: false }),
};
