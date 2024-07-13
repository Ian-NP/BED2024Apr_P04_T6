import Joi from "joi";

// Schemas
const addNewConversationSchema = Joi.object({
    conversationTitle: Joi.string()
        .min(1)
        .max(1000)
        .required()
        .messages({
            'string.base': 'Conversation title should be a type of text',
            'string.empty': 'Conversation title cannot be empty',
            'string.min': 'Conversation title should have a minimum length of 1 character',
            'string.max': 'Conversation title should have a maximum length of 1000 characters',
            'any.required': 'Conversation title is a required field'
        })
});

const editConversationTitleSchema = Joi.object({
    conversationTitle: Joi.string()
        .min(1)
        .max(1000)
        .required()
        .messages({
            'string.base': 'Conversation title should be a type of text',
            'string.empty': 'Conversation title cannot be empty',
            'string.min': 'Conversation title should have a minimum length of 1 character',
            'string.max': 'Conversation title should have a maximum length of 1000 characters',
            'any.required': 'Conversation title is a required field'
        }),
});

const addChatHistorySchema = Joi.object({
    query: Joi.string()
        .max(1073741823) // Adjust this based on your actual text size limits
        .required()
        .messages({
            'string.base': 'Text should be a type of text',
            'string.empty': 'Text cannot be empty',
            'string.max': 'Text should have a maximum length of 10000 characters',
            'any.required': 'Text is a required field'
        }),
});

// Middleware functions for validation
const validateAddNewConversation = (req, res, next) => {
    const { error } = addNewConversationSchema.validate(req.body, { abortEarly: false });
    console.log("error occured with add new conversation validation");
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({ message: 'Validation error', errors });
    }
    next();
};

const validateEditConversationTitle = (req, res, next) => {
    const { error } = editConversationTitleSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({ message: 'Validation error', errors });
    }
    next();
};

const validateAddChatHistory = (req, res, next) => {
    const { error } = addChatHistorySchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map((detail) => console.log(detail.message));
        return res.status(400).json({ message: 'Validation error', errors });
    }
    next();
};

module.exports = {
    validateAddNewConversation,
    validateEditConversationTitle,
    validateAddChatHistory
};
