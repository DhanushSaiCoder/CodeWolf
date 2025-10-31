const express = require('express');
const router = express.Router();
const { User } = require('../models/User');

// @route   GET /leaderboard
// @desc    Get top 10 users by rating
// @access  Public
router.get('/', async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ rating: -1 })
      .limit(10)
      .select('username rating problemsSolved'); // Select the fields to return

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;