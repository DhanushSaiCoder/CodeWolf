const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');
const Joi = require('joi');

// Define validation schema
const friendSchema = Joi.object({
    id: Joi.string().required(),
    username: Joi.string().required(),
    rating: Joi.number().required()
});

router.post('/', authenticateToken, async (req, res) => {
    console.log('Request body:', req.body); // Log request body

    // Validate request body
    const { error } = friendSchema.validate(req.body);
    if (error) {
        return res.status(400).send(`Invalid request: ${error.details[0].message}`);
    }

    const { id, username, rating } = req.body;

    try {
        // Get the logged-in user's document
        const user = await User.findOne({ _id: req.user._id });

        const otherUser = await User.findOne({ _id: id })

        if (!user) return res.status(404).send("User not found");

        // Check if otherUser exists and has a status
        if (!otherUser) {
            return res.status(404).send("Other user not found");
        }

        if (!otherUser.status) {
            return res.status(400).send("Other user's status not found");
        }

        // Push the friend's info into the friends array, including the status
        const friend = {
            id: id,
            username: username,
            rating: rating,
            status: otherUser.status.status
        };


        user.friends.push(friend);
        await user.save();

        otherUser.friends.push({
            id: user.id,
            username: user.username,
            rating:user.rating,
            status: user.status
        })
        await otherUser.save()
        
        res.send(user);
    } catch (err) {
        console.error(err); // Log the error
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
