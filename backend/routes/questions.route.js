const express = require('express');
const router = express.Router();
const { validateQuestion, Question } = require("../models/Question")

router.post('/', async (req, res) => {
    const { error } = validateQuestion(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const question = new Question(req.body);
        await question.save();
        res.status(201).send(question);
    } catch (err) {
        res.status(500).send("Something went wrong while saving the question.");
    }
});


module.exports = router