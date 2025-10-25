const express = require('express')
const router = express.Router()

router.post('/js', async (req, res) => {
    res.send("got request")
})

module.exports = router