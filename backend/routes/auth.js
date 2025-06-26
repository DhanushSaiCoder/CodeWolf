const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { validateUser, User } = require('../models/User')
const authenticateToken = require('../middleware/authenticateToken')

//getLogged in user document
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
})

router.get('/user', async (req, res) => {
    try {
        // Expecting query parameters: /user?requesterId=<id>&receiverId=<id>
        const { requesterId, receiverId } = req.query;

        // Validate that both query parameters are provided
        if (!requesterId || !receiverId) {
            return res.status(400).json({ message: 'Both requesterId and receiverId are required as query parameters.' });
        }

        // Find both the requester and the receiver user documents, excluding their passwords
        const requester = await User.findById(requesterId).select('-password');
        const receiver = await User.findById(receiverId).select('-password');

        // Check if both users exist
        if (!requester || !receiver) {
            return res.status(404).json({ message: 'One or both users were not found.' });
        }

        // Send both documents in the response
        res.status(200).json({ requester, receiver });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
});

// Get all users except one's friends and himself
router.get('/nonfriends', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const friends = user.friends.map(friend => friend.id);
        friends.push(req.user._id);
        const users = await User.find({ _id: { $nin: friends } }, '_id username rating status').lean();
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
});

router.get('/users', async (req, res) => {
    try {
        // Fetch top 10 users, selecting only 'username' and 'rating', and sort by rating in descending order
        const users = await User.find({}, '_id username rating')
            .sort({ rating: -1 }) // Sort by rating in descending order
            .limit(10) // Limit the results to the top 10 users
            .lean();

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found.' });
        }

        res.status(200).json(users); // Send the sorted list of top 10 users
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
});

router.get('/signup', (req, res) => {
    res.send('signup page');
});

// Serve the login page
router.get('/login', (req, res) => {
    res.send('login page');
});

// Register

router.post('/signup', async (req, res) => {
    // **Data Validation**
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    try {
        // **Email Uniqueness Check**
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) return res.status(400).send({ message: 'Email already exists' });

        // **Password Hashing and User Creation**
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role
        });

        // **Saving User to Database**
        const savedUser = await user.save();

        // **Generating Token**
        const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET);
        res.header('auth-token', token).send({
            newUser: savedUser,
            token: token,
        });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send({ message: 'An unexpected error occurred. Please try again later.' });
    }
});


// Login
router.post('/login', async (req, res) => {
    // Validate the data before logging in a user
    if (!req.body.email || !req.body.password) return res.status(400).send({ message: 'Email and password are required' })

    // Check if the email exists
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send({ message: 'User Not Found, Sign Up.' })

    // Check if the password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if (!validPass) return res.status(400).send({ message: 'Invalid password' })

    // Create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
    res.header('auth-token', token).send({ token: token })
})

module.exports = router
