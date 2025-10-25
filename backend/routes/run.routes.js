const express = require('express')
const router = express.Router()

router.post('/js', async (req, res) => {
    const { code, question_id } = req.body

    res.send({status: "code ran successfully", code, question_id})
})

module.exports = router 