const Joi = require('joi');

const projectSchema = Joi.object({
  project_name: Joi.string().trim().required().messages({
    'string.empty': 'Project name cannot be empty',
    'any.required': 'Project name is required'
  }),
  status: Joi.string().valid('not started', 'in progress', 'completed').default('not started').messages({
    'any.only': 'Status must be either not started, in progress, or completed'
  }),
  start_date: Joi.date().min('now').required().messages({
    'date.base': 'Start date must be a valid date',
    'date.min': 'Start date cannot be before today',
    'any.required': 'Start date is required'
  }),
  end_date: Joi.date().min(Joi.ref('start_date')).required().messages({
    'date.base': 'End date must be a valid date',
    'date.min': 'End date must be after start date',
    'any.required': 'End date is required'
  }),
  id_teamMembre: Joi.array().items(Joi.string().hex().length(24)).messages({
    'string.hex': 'Each team member ID must be a valid ObjectId'
  }),
  id_tasks: Joi.array().items(Joi.string().hex().length(24)).messages({
    'string.hex': 'Each task ID must be a valid ObjectId'
  })
});

module.exports = {
  validateProject: (data) => projectSchema.validate(data, { abortEarly: false })

};
