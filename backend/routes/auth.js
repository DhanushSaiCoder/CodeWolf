const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {validateUser, User} = require('../models/User')

router.get('/signup', (req, res) => {
    res.send('signup page');
});

// Serve the login page
router.get('/login', (req, res) => {
    res.send('login page');
});

// Register
router.post('/signup', async (req, res) => {
    // Validate the data before creating a user
    const { error } = validateUser(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // Check if the user is already in the database
    const emailExists = await User.findOne({ email: req.body.email })
    if (emailExists) return res.status(400).send('Email already exists')

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    // Create a new user
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role
    })

    try {
        // Save the user to the database
        const savedUser = await user.save()
        res.status(200).send(savedUser)
    } catch (err) {
        res.status(400).send(err)
    }
})

// Login
router.post('/login', async (req, res) => {
    // Validate the data before logging in a user
    if (!req.body.email || !req.body.password) return res.status(400).send('Email and password are required')
        
    // Check if the email exists
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send('Email or password is wrong')

    // Check if the password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if (!validPass) return res.status(400).send('Invalid password')

    // Create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
    res.header('auth-token', token).send(token)
})

module.exports = router
