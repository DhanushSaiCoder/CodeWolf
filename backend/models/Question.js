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

module.exports = Question;
