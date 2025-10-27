const express = require('express')
const router = express.Router()

router.post('/js', async (req, res) => {
    const {code, questionDoc} = req.body
    
    res.json(req.body)
})

module.exports = router