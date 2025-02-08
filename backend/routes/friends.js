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
    status: Joi.string().valid('online', 'offline', 'inMatch').optional(),
});

router.post('/online/:id', async (req, res) => {
  try {
    const userId = req.params.id; // The ID of the user whose status is changing
    const status = req.body.status || 'online'; // Default to 'online' if not provided

    // Convert userId to ObjectId if it's not already one
    const friendId = new mongoose.Types.ObjectId(userId); // Use `new` to invoke ObjectId

    // Update the user's own status
    await User.updateOne(
      { _id: friendId },
      { $set: { status: status } }
    );

    // Update the status of the friend in the friends array of all other users
    const result = await User.updateMany(
      {
        _id: { $ne: friendId }, // Exclude the current user
        'friends.id': friendId, // Users who have this user in their friends array
      },
      {
        $set: { 'friends.$[elem].status': status }, // Update the status field of the matching friend
      },
      {
        arrayFilters: [{ 'elem.id': friendId }], // Filter to match the specific friend in the array
        multi: true, // Update multiple documents
      }
    );

    res.status(200).json({ message: 'Status updated successfully', result });
  } catch (error) {
    console.error('Error updating friend status:', error);
    res.status(500).json({ error: 'Server error' });
  }
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
    if (!user) return res.status(404).send("User not found");

    // Get the other user's document
    const otherUser = await User.findOne({ _id: id });
    if (!otherUser) return res.status(404).send("Other user not found");

    // Check if the user is trying to add themselves
    if (user._id.equals(id)) {
      return res.status(400).send("You cannot add yourself as a friend");
    }

    // Check if otherUser exists and has a status
    if (!otherUser.status) {
      return res.status(400).send("Other user's status not found");
    }

    // Prevent duplicate friends
    const alreadyFriends = user.friends.some((friend) => friend.id.equals(id));
    if (alreadyFriends) {
      return res.status(400).send("User is already your friend");
    }

    // Prepare the friend object with the current status
    const friend = {
      id: new mongoose.Types.ObjectId(id), // Use `new` to invoke ObjectId
      username: username,
      rating: rating,
      status: otherUser.status,
    };

    console.log('friend: ', friend);

    // Add friend to user's friends array
    user.friends.push(friend);
    await user.save();

    // Add the user to the other user's friends array
    otherUser.friends.push({
      id: user._id, // Ensure you're using _id here
      username: user.username,
      rating: user.rating,
      status: user.status,
    });
    await otherUser.save();

    res.send(user);
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
