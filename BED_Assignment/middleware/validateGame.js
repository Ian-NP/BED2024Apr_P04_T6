const Joi = require('joi');

// Define the Joi schema for save game validation
const saveGameSchema = Joi.object({
    gridSize: Joi.number().integer().min(1).required().messages({
        'number.base': 'Grid size must be a number',
        'number.integer': 'Grid size must be an integer',
        'number.min': 'Grid size must be at least 1',
        'any.required': 'Grid size is required'
    }),
    buildingsGrid: Joi.array().items(
        Joi.array().items(
            Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            )
        )
    ).required().messages({
        'array.base': 'Buildings grid must be an array',
        'any.required': 'Buildings grid is required'
    }),
    points: Joi.number().integer().min(0).required().messages({
        'number.base': 'Points must be a number',
        'number.integer': 'Points must be an integer',
        'number.min': 'Points must be at least 0',
        'any.required': 'Points are required'
    }),
    coins: Joi.number().integer().required().messages({
        'number.base': 'Coins must be a number',
        'number.integer': 'Coins must be an integer',
        'any.required': 'Coins are required'
    }),
    turnNumber: Joi.number().integer().min(0).required().messages({
        'number.base': 'Turn number must be a number',
        'number.integer': 'Turn number must be an integer',
        'number.min': 'Turn number must be at least 0',
        'any.required': 'Turn number is required'
    }),
    gameMode: Joi.string().valid('freePlay', 'arcade').required().messages({
        'string.base': 'Game mode must be a string',
        'any.only': 'Game mode must be either "freePlay" or "arcade"',
        'any.required': 'Game mode is required'
    }),
    saveDate: Joi.date().iso().required().messages({
        'date.base': 'Save date must be a valid date',
        'date.format': 'Save date must be in ISO format',
        'any.required': 'Save date is required'
    })
});

// Middleware to validate save game data
const validateSaveGame = (req, res, next) => {
    const { error } = saveGameSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(err => err.message);
        console.log(errors);
        return res.status(400).json({ status: 'error', errors });
    }
    
    next();
};

module.exports = validateSaveGame;