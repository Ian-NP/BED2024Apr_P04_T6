const Joi = require("joi");

const validateUser = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Must be a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
    userType: Joi.string().valid('N', 'C').required().messages({
      'any.only': 'User type must be either "N" or "C"',
      'any.required': 'User type is required',
    }),
    name: Joi.when('userType', {
      is: 'N',
      then: Joi.string().min(3).required().messages({
        'string.min': 'Name must be at least 3 characters long',
        'any.required': 'Name is required for normal users',
      }),
      otherwise: Joi.forbidden(),
    }),
    companyName: Joi.when('userType', {
      is: 'C',
      then: Joi.string().min(3).required().messages({
        'string.min': 'Company name must be at least 3 characters long',
        'any.required': 'Company name is required for company users',
      }),
      otherwise: Joi.forbidden(),
    }),
    paypalEmail: Joi.when('userType', {
      is: 'C',
      then: Joi.string().email().required().messages({
        'string.email': 'Must be a valid email address',
        'any.required': 'PayPal email is required for company users',
      }),
      otherwise: Joi.forbidden(),
    }),
  });

  const validation = schema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    return res.status(400).json({ message: "Validation error", errors });
  }

  next();
};

module.exports = validateUser;
