const mongoose = require('mongoose');
const Joi = require('joi');

const questionSchema = new mongoose.Schema({
    question_title: { type: String, required: true },
    question_description: [{ type: String }],
    question_difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
    question_programming_language: { type: String, required: true },
    question_mode: { type: String, required: true },
    function_name: { type: String, required: false },
    function_return_type: {type: String, required: false},
    parameters: [{ type: String, required: false }],
    extra_headers: [{type: String, required: false}],

    // Slug for querying
    mode_slug: { type: String, required: true, lowercase: true, index: true },

    buggy_code: { type: String },
    default_code: { type: String },
    hints: [{ type: String }],
    test_cases: [
        {
            input: { type: mongoose.Schema.Types.Mixed, required: true },
            expected_output: { type: mongoose.Schema.Types.Mixed, required: true }
        }
    ],
    examples: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true }
        }
    ],

    tags: [{ type: String }],
    created_by: { type: mongoose.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Pre-save hook to generate mode_slug from question_mode
questionSchema.pre('save', function (next) {
    this.mode_slug = this.question_mode
        .trim()
        .split(/\s+/).join('-')
        .toLowerCase();
    next();
});

const Question = mongoose.model('Question', questionSchema);

// Joi validation schema
const validateQuestion = (question) => {
    const schema = Joi.object({
        question_title: Joi.string().required(),
        question_description: Joi.array().items(Joi.string()),
        question_difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
        question_programming_language: Joi.string().required(),
        question_mode: Joi.string().required(),
        mode_slug: Joi.string().optional(),
        function_name: Joi.string().optional(),
        function_return_type: Joi.string().optional(),
        parameters: Joi.array().items(Joi.string()).optional(),
        extra_headers: Joi.array().items(Joi.string()).optional(),

        buggy_code: Joi.string().allow(null, ''),
        default_code: Joi.string().allow(null),
        hints: Joi.array().items(Joi.string()),
        test_cases: Joi.array()
            .items(
                Joi.object({
                    input: Joi.any().required(),
                    expected_output: Joi.any().required().allow(null),
                })
            )
            .required(),
        examples: Joi.array().items(
            Joi.object({ input: Joi.string().required(), output: Joi.string().required() })
        ),
        tags: Joi.array().items(Joi.string()),
        created_by: Joi.string().optional(),
        created_at: Joi.date().optional(),
        updated_at: Joi.date().optional()
    });
    return schema.validate(question);
};

module.exports = {
    Question,
    validateQuestion
};
