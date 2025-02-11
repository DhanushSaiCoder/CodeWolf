const mongoose = require("mongoose");
const joi = require("joi");

const matchObj = {
    players: [{
        id: 'aMongoDbId',
        username: 'aUsername',
        rating: 962,
    }, {
        id: 'aMongoDbId',
        username: 'aUsername',
        rating: 945,
    }],
    winner: 'aMongoDbId',
    loser: 'aMongoDbId',
}

const matchSchema = new mongoose.Schema({
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
        }
    }],
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    loser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

const Match = mongoose.model("Match", matchSchema);

function validateMatch(match) {
    console.log(match);
    const schema = joi.object({
        players: joi.array().items(joi.object({
            id: joi.string().required(),
            username: joi.string().required(),
            rating: joi.number().required()
        })).required(),
        winner: joi.string().default(null),
        loser: joi.string().default(null)
    });
    return schema.validate(match);
}

module.exports = {
    Match,
    validateMatch
};
