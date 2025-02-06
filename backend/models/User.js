const mongoose = require("mongoose");
const joi = require("joi");

const friendSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        default: 'offline',
        enum: ['online', 'offline', 'inMatch']
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please provide a valid email address"]
    },
    password: {
        type: String,
        required: true
    },
    friends: {
        type: [friendSchema],
        default: []
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    rating: {
        type: Number,
        default: 1000,
        min: 0
    },
    status: {
        type: String,
        default: 'offline',
        enum: ['online', 'offline', 'inMatch']
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

function validateUser(user) {
    console.log(user);
    const schema = joi.object({
        username: joi.string().min(3).max(50).required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        role: joi.string().default('user').valid('user', 'admin').optional(),
        rating: joi.number().min(0).default(1000).optional(),
        status: joi.string().default('offline').valid('online', 'offline', 'inMatch').optional()
    });
    return schema.validate(user);
}

module.exports = {
    User,
    validateUser
};
