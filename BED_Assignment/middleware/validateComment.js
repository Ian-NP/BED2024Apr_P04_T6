import Joi from "joi";

const validateComment = (req, res, next) => {
    const articleCommentSchema = Joi.object({
        content: Joi.string()
            .min(1)
            .max(1000)
            .required()
            .messages({
                'string.base': 'Content should be a type of text',
                'string.empty': 'Content cannot be empty',
                'string.min': 'Content should have a minimum length of 1 character',
                'string.max': 'Content should have a maximum length of 1000 characters',
                'any.required': 'Content is a required field'
            }),
        score: Joi.number()
            .integer()
            .default(0)
            .messages({
                'number.base': 'Score should be a number',
                'number.integer': 'Score should be an integer'
            }),
        timeStamp: Joi.date()
            .required()
            .messages({
                'date.base': 'TimeStamp should be a valid date',
                'any.required': 'TimeStamp is a required field'
            }),
        userId: Joi.number()
            .integer()
            .required()
            .messages({
                'number.base': 'UserId should be a number',
                'number.integer': 'UserId should be an integer',
                'any.required': 'UserId is a required field'
            }),
        articleId: Joi.number()
            .integer()
            .required()
            .messages({
                'number.base': 'ArticleId should be a number',
                'number.integer': 'ArticleId should be an integer',
                'any.required': 'ArticleId is a required field'
            }),
        parentCommentId: Joi.number()
            .integer()
            .allow(null)
            .messages({
                'number.base': 'ParentCommentId should be a number',
                'number.integer': 'ParentCommentId should be an integer'
            })
    });
    
    const eventCommentSchema = Joi.object({
        content: Joi.string()
            .min(1)
            .max(1000)
            .required()
            .messages({
                'string.base': 'Content should be a type of text',
                'string.empty': 'Content cannot be empty',
                'string.min': 'Content should have a minimum length of 1 character',
                'string.max': 'Content should have a maximum length of 1000 characters',
                'any.required': 'Content is a required field'
            }),
        score: Joi.number()
            .integer()
            .default(0)
            .messages({
                'number.base': 'Score should be a number',
                'number.integer': 'Score should be an integer'
            }),
        timeStamp: Joi.date()
            .required()
            .messages({
                'date.base': 'TimeStamp should be a valid date',
                'any.required': 'TimeStamp is a required field'
            }),
        userId: Joi.number()
            .integer()
            .required()
            .messages({
                'number.base': 'UserId should be a number',
                'number.integer': 'UserId should be an integer',
                'any.required': 'UserId is a required field'
            }),
        eventId: Joi.number()
            .integer()
            .required()
            .messages({
                'number.base': 'EventId should be a number',
                'number.integer': 'EventId should be an integer',
                'any.required': 'EventId is a required field'
            }),
        parentCommentId: Joi.number()
            .integer()
            .allow(null)
            .messages({
                'number.base': 'ParentCommentId should be a number',
                'number.integer': 'ParentCommentId should be an integer'
            })
    });

    const updateCommentSchema = Joi.object({
        commentId: Joi.number()
            .integer()
            .required()
            .messages({
                'number.base': 'CommentId should be a number',
                'number.integer': 'CommentId should be an integer',
                'any.required': 'CommentId is a required field'
            }),
        content: Joi.string()
            .min(1)
            .max(1000)
            .allow(null)
            .optional()
            .messages({
                'string.base': 'Content should be a type of text',
                'string.empty': 'Content cannot be empty',
                'string.min': 'Content should have a minimum length of 1 character',
                'string.max': 'Content should have a maximum length of 1000 characters'
            }),
        score: Joi.number()
            .integer()
            .allow(null)
            .optional()
            .messages({
                'number.base': 'Score should be a number',
                'number.integer': 'Score should be an integer'
            })
    });

    let validation;
    if (req.body.articleId){
        validation = articleCommentSchema.validate(req.body, { abortEarly: false });
    } else if (req.body.eventId){
        validation = eventCommentSchema.validate(req.body, { abortEarly: false });
    } else{
        validation = updateCommentSchema.validate(req.body, { abortEarly: false });
    }

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        console.log('Validation errors:', errors);
        return res.status(400).json({ message: 'Validation error', errors });
    }

    next();
};

module.exports = validateComment;