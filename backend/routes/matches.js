const express = require('express')
const router = express.Router()
const { validateMatch, Match } = require('../models/Match')

router.get('/', async (req, res) => {
    const matches = await Match.find()
    res.send(matches)
})

router.get('/:id', async (req, res) => {
    const match = await Match.findById(req.params.id)
    if (!match) return res.status(404).send('The match with the given ID was not found.')
    res.send(match)
})

router.post('/', async (req, res) => {
    const { error } = validateMatch(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const match = new Match({
        players: req.body.players,
        winner: req.body.winner,
        loser: req.body.loser,
        mode: req.body.mode,
        difficulty: req.body.difficulty,
        language: req.body.language,
        status: req.body.status
    })

    await match.save()
    res.send(match)
})

// PATCH request to update a match document
router.patch('/:id', async (req, res) => {

    const match = await Match.findByIdAndUpdate(req.params.id, {
        questionId: req.body.questionId,
    }, { new: true })

    if (!match) return res.status(404).send('The match with the given ID was not found.')

    res.status(200).send(match)
})


module.exports = router

