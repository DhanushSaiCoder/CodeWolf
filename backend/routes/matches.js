const express = require('express')
const router = express.Router()
const { validateMatch, Match } = require('../models/Match')

router.get('/', async (req, res) => {
    const matches = await Match.find()
    res.send(matches)
})

router.post('/', async (req, res) => {
    const { error } = validateMatch(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const match = new Match({
        players: req.body.players,
        winner: req.body.winner,
        loser: req.body.loser
    })

    await match.save()
    res.send(match)
})

module.exports = router

