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

router.get('/', async (req, res) => {
    try {
        const { mode, difficulty, language } = req.query;

        // Build dynamic filter object
        const query = {};
        if (mode) query.question_mode = mode;
        if (difficulty) query.question_difficulty = difficulty;
        if (language) query.programming_language = language;

        const questions = await Question.find(query);

        // If no questions match, still return 200 with empty array
        res.status(200).json({
            success: true,
            message: questions.length
                ? 'Questions retrieved successfully'
                : 'No questions found matching the criteria',
            data: questions
        });
    } catch (err) {
        console.error('Error in GET /questions:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
});


module.exports = router