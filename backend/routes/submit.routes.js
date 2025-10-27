const express = require('express')
const router = express.Router()

router.post('/js', async (req, res) => {
    const {code, questionDoc} = req.body
    
    res.send("[SERVER] response from /submit/js route.")
})

module.exports = router