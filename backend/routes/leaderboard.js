const express = require('express');
const router = express.Router();
const { User } = require('../models/User');

// @route   GET /leaderboard
// @desc    Get top 10 users by rating
// @access  Public
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const leaderboard = await User.find()
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit)
      .select('username rating problemsSolved profilePic'); // Select the fields to return

    res.json({ leaderboard, totalPages });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;