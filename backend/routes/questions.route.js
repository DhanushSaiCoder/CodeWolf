const express = require('express');
const router = express.Router();
const { validateQuestion, Question } = require("../models/Question");

// CREATE QUESTION
router.post('/', async (req, res) => {
    const { error } = validateQuestion(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    try {
        const question = new Question(req.body);
        // Inline slug generation (pre-save hook also applies)
        question.mode_slug = question.question_mode
            .trim()
            .split(/\s+/).join('-')
            .toLowerCase();

        await question.save();
        res.status(201).json({ success: true, data: question });
    } catch (err) {
        console.error('POST /questions error:', err);
        res.status(500).json({ success: false, message: 'Something went wrong while saving the question.' });
    }
});

// GET QUESTIONS WITH FLEXIBLE FILTERS
router.get('/', async (req, res) => {
    try {
        // Log full query for debugging
        console.log('GET /questions req.query:', req.query);

        // Support multiple aliases
        const {
            mode_slug,
            mode,
            question_mode,
            difficulty,
            question_difficulty,
            programming_language,
            language,
            question_programming_language
        } = req.query;

        const filter = {};
        // Slug-based mode
        const slug = mode_slug || mode || question_mode;
        if (slug) filter.mode_slug = slug.trim().replace(/\s+/g, '-').toLowerCase();

        // Difficulty
        const diff = question_difficulty || difficulty;
        if (diff) filter.question_difficulty = diff;

        // Language
        const lang = question_programming_language || programming_language || language;
        if (lang) filter.question_programming_language = lang;

        console.log('Filter built:', filter);
        const questions = await Question.find(filter);

        res.status(200).json({
            success: true,
            message: questions.length
                ? 'Questions retrieved successfully'
                : 'No questions found matching the criteria',
            data: questions
        });
    } catch (err) {
        console.error('Error in GET /questions:', err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
});

module.exports = router;
