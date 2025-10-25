const express = require('express')
const router = express.Router()
const { VM } = require('vm2')

router.post('/js', async (req, res) => {
    const { code, question_id } = req.body
    let output = [];

    const vm = new VM({
        timeout: 1000,
        sandbox: {
            console: {
                log: (...args) => output.push(args.join(" ")),
            },
        },
    });

    try {
        vm.run(code);
        res.json({ output: output.join("\n") });
    } catch (err) {
        res.json({ error: err.message });
    }

})

module.exports = router 