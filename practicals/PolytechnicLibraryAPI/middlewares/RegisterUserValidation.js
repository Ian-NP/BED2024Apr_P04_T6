import Joi from "joi";

const RegisterUserValidation = (req, res, next) =>{
    const userSchema = Joi.object({
        username: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': 'Username should be a type of text',
            'string.empty': 'Username cannot be an empty field',
            'string.min': 'Username should have a minimum length of 3 characters',
            'string.max': 'Username should have a maximum length of 30 characters',
            'any.required': 'Username is a required field'
        }),
        password: Joi.string()
            .min(6)
            .required()
            .messages({
                'string.base': 'Password should be a type of text',
                'string.empty': 'Password cannot be an empty field',
                'string.min': 'Password should have a minimum length of 6 characters',
                'any.required': 'Password is a required field'
            }),
        role: Joi.string()
            .valid('member', 'librarian')
            .required()
            .messages({
                'string.base': 'Role should be a type of text',
                'any.only': 'Role must be either member or librarian',
                'any.required': 'Role is a required field'
            })
    });

    const validation = userSchema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        console.log('Validation errors:', errors);
        return res.status(400).json({ message: errors[0] });
    }

    next();
}

module.exports = RegisterUserValidation;