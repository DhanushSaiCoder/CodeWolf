const mongoose = require("mongoose");
const joi = require("joi");

// Updated match schema with a status field
const matchSchema = new mongoose.Schema({
    questionId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        optional: true
    },
    players: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        profilePic: {
            type: String,
            optional: true
        }
    }],
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    winner_rating_delta: {
        type: Number, 
        default: 0 
    },
    loser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    loser_rating_delta: {
        type: Number, 
        default: 0 
    },
    mode: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'pending'  // Default status set to "pending"
    }
}, { timestamps: true });

const Match = mongoose.model("Match", matchSchema);

// Update the Joi validation schema to include the new status field
function validateMatch(match) {
    const schema = joi.object({
        questionId: joi.string().optional(),
        players: joi.array().items(joi.object({
            id: joi.string().required(),
            username: joi.string().required(),
            rating: joi.number().required(),
            profilePic: joi.string().allow('').optional()
        })).required(),
        winner: joi.string().allow(null).default(null),
        winner_rating_delta: joi.string().allow(null).default(0),
        loser: joi.string().allow(null).default(null),
        loser_rating_delta: joi.string().allow(null).default(0),
        mode: joi.string().required(),
        language: joi.string().required(),
        difficulty: joi.string().required(),
        status: joi.string().default('pending')
    });
    return schema.validate(match);
}

module.exports = {
    Match,
    validateMatch
};
