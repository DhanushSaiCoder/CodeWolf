const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { validateUser, User } = require('../models/User')

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
    if (error) return res.status(400).send({message: error.details[0].message});

    try {
        // **Email Uniqueness Check**
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) return res.status(400).send({message: 'Email already exists'});

        // **Password Hashing and User Creation**
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role,
        });

        // **Saving User to Database**
        const savedUser = await user.save();
        res.status(200).send({newUser: savedUser});
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send({message: 'An unexpected error occurred. Please try again later.'});
    }
});


// Login
router.post('/login', async (req, res) => {
    // Validate the data before logging in a user
    if (!req.body.email || !req.body.password) return res.status(400).send({message:  'Email and password are required'})

    // Check if the email exists
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send({message:'User Not Found, Sign Up.'})

    // Check if the password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if (!validPass) return res.status(400).send({message:'Invalid password'})

    // Create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
    res.header('auth-token', token).send({token: token})
})

module.exports = router
