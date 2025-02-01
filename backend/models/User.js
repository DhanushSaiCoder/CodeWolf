const mongoose = require("mongoose");
const joi = require("joi");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,  // Automatically trims leading/trailing spaces
        minlength: 3,  // Minimum length for username (optional)
        maxlength: 50  // Maximum length for username (optional)
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,  // Ensures email is stored in lowercase
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please provide a valid email address"] // Email format validation
    },
    password: {
        type: String,
        required: true
    },
    friends: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        default: []
    },
    role: {
        type: String,
        required: false,
        default: 'user',
        enum: ['user', 'admin']
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

function validateUser(user) {
    console.log(user);
    const schema = joi.object({
        username: joi.string().min(3).max(50).required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        role: joi.string().default('user').valid('user', 'admin').optional()
    });
    return schema.validate(user);
}

module.exports = {
    User,
    validateUser
};
