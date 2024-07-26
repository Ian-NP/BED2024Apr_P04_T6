const Joi = require('joi');

// Define the Joi schema for event validation
const eventSchema = Joi.object({
    eventName: Joi.string().max(20).required().messages({
        'string.empty': 'Event name is required',
        'string.max': 'Event name must be less than or equal to 20 characters'
    }),
    eventDesc: Joi.string().max(700).required().messages({
        'string.empty': 'Event description is required',
        'string.max': 'Event description must be less than or equal to 700 characters'
    }),
    eventOverview: Joi.string().max(80).required().messages({
        'string.empty': 'Event overview is required',
        'string.max': 'Event overview must be less than or equal to 150 characters'
    }),
    eventCategory: Joi.string()
        .valid(
            'Hackathons',
            'Conferences',
            'Talks',
            'Workshops',
            'Seminars',
            'Bootcamps',
            'Networking Events',
            'Webinars'
        )
        .max(50)
        .required()
        .messages({
            'any.only': 'Event category must be one of the following: Hackathons, Conferences, Talks, Workshops, Seminars, Bootcamps, Networking Events, Webinars',
            'string.empty': 'Event category is required',
            'string.max': 'Event category must be less than or equal to 50 characters'
        }),
    eventReports: Joi.number().integer().default(0).messages({
        'number.base': 'Event reports must be an integer'
    }),
    eventTime: Joi.date().iso().required().messages({
        'date.base': 'Event time must be a valid ISO date',
        'date.format': 'Event time must be in ISO date format',
        'any.required': 'Event time is required'
    }),
    cost: Joi.number().precision(2).required().messages({
        'number.base': 'Cost must be a number',
        'number.precision': 'Cost must have at most 2 decimal places',
        'any.required': 'Cost is required'
    }),
    eventImage: Joi.string().pattern(/^data:image\/(png|jpeg|jpg|gif);base64,/).required().messages({
        'string.pattern.base': 'Event image must be a base64 encoded image (png, jpeg, jpg, gif)',
        'any.required': 'Event image is required'
    })
});

// Middleware to validate event data
const validateEvent = (req, res, next) => {
    const { error } = eventSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(err => err.message);
        return res.status(400).json({ errors });
    }
    next();
};

module.exports = validateEvent;
