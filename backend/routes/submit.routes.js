const express = require('express')
const router = express.Router()

router.post('/js', async (req, res) => {
    const {c, questionDoc} = req.body
    let code = c;

    res.json(req.body)
})

module.exports = router