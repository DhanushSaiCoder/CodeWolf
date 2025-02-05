const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, async (req, res) => {
    // Manual validation of req.body
    const { id, username, rating } = req.body;
    if (!id || !username || rating == null) {
        return res.status(400).send('Invalid request: Please provide id, username, rating, and status.');
    }

    try {
        // Get the logged-in user's document
        const user = await User.findOne({ _id: req.user._id });

        if (!user) return res.status(404).send("User not found");

        // Push the req.body to the friends array
        user.friends.push(req.body);
        await user.save();

        res.send(user);
    } catch (err) {
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
