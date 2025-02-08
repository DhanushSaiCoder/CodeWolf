// friends.js
const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');
const Joi = require('joi');
const mongoose = require('mongoose');

// Define validation schema
const friendSchema = Joi.object({
  id: Joi.string().required(),
  username: Joi.string().required(),
  rating: Joi.number().required(),
});

// Route to add a friend
router.post('/', authenticateToken, async (req, res) => {
  // Validate request body
  const { error } = friendSchema.validate(req.body);
  if (error) {
    return res.status(400).send(`Invalid request: ${error.details[0].message}`);
  }

  const { id, username, rating } = req.body;

  try {
    // Get the logged-in user's document
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send('User not found');

    // Get the other user's document
    const otherUser = await User.findById(id);
    if (!otherUser) return res.status(404).send('Other user not found');

    // Check if the user is trying to add themselves
    if (user._id.equals(id)) {
      return res.status(400).send('You cannot add yourself as a friend');
    }

    // Prevent duplicate friends
    const alreadyFriends = user.friends.some((friend) => friend.id.equals(id));
    if (alreadyFriends) {
      return res.status(400).send('User is already your friend');
    }

    // Prepare the friend object with the current status
    const friend = {
      id: new mongoose.Types.ObjectId(id),
      username: username,
      rating: rating,
      status: otherUser.status || 'offline', // Get the current status or default to 'offline'
    };

    // Add friend to user's friends array
    user.friends.push(friend);
    await user.save();

    // Add the user to the other user's friends array
    otherUser.friends.push({
      id: user._id,
      username: user.username,
      rating: user.rating,
      status: user.status || 'offline',
    });
    await otherUser.save();

    res.send(user);
  } catch (err) {
    console.error('Error adding friend:', err);
    res.status(500).send('Internal server error');
  }
});

// Route to get the user's friends list
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('friends');
    if (!user) return res.status(404).send('User not found');

    res.json({ friends: user.friends });
  } catch (err) {
    console.error('Error fetching friends list:', err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
