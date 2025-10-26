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

router.post("/c", async (req, res) => {
  const { code, question_id } = req.body;

  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "c",
        version: "*", // latest version of C compiler
        files: [
          {
            name: "main.c",
            content: code,
          },
        ],
      }),
    });

    // Parse response
    const data = await response.json();

    res.json({
      question_id,
      output: data.run.output,
      error: data.run.stderr,
      exitCode: data.run.code,
    });
  } catch (err) {
    console.error("Error executing C code:", err.message);
    res.status(500).json({ error: "Code execution failed" });
  }
});



module.exports = router 