const mongoose = require('mongoose');
const Joi = require('joi');

const questionSchema = new mongoose.Schema({
    question_title: {
        type: String,
        required: true
    },
    question_description: [{
        type: String,
    }],
    question_difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard']
    },
    examples: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            }
        }
    ],
    question_mode: {
        type: String,
        required: true
    },
    expected_output: {
        type: String,
        required: true
    }
});

const Question = mongoose.model('Question', questionSchema);

const validateQuestion = (question) => {
    const schema = Joi.object({
        question_title: Joi.string().required(),
        question_description: Joi.array().items(Joi.string()),
        question_difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
        examples: Joi.array().items(
            Joi.object({
                input: Joi.string().required(),
                output: Joi.string().required()
            })
        ),
        question_mode: Joi.string().required(),
        expected_output: Joi.string().required()
    });

    return schema.validate(question);
};

module.exports = {
    Question,
    validateQuestion
};