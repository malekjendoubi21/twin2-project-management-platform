const Joi = require('joi');

const skillSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': 'Description is required',
    'any.required': 'Description is required',
  }),
  category: Joi.string().valid('Technical', 'Soft Skill', 'Management').required().messages({
    'any.only': 'Category must be either Technical, Soft Skill, or Management',
    'any.required': 'Category is required',
  }),
  tags: Joi.array().items(Joi.string().trim()).default([]),
});

module.exports = {
  validateSkill: (data) => skillSchema.validate(data, { abortEarly: false }),
};
