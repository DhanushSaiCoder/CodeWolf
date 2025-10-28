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


router.post("/py", async (req, res) => {
  const { code, question_id } = req.body;

  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: "python",
        version: "*",
        files: [
          {
            name: "main.py",
            content: code,
          },
        ],
      }),
    });

    const result = await response.json();
    const output = result.run.output.trim();
    const error = result.run.stderr.trim();

    res.json(error.length ? {error} : {output})

  } catch (err) {
    res.json({ error: err.message });
  }
});



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



router.post("/java", async (req, res) => {
  const { code, question_id } = req.body;

  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "java",
        version: "*", // latest available Java version
        files: [
          {
            name: "Main.java",
            content: code,
          },
        ],
      }),
    });

    const data = await response.json();

    res.json({
      question_id,
      output: data.run.output,
      error: data.run.stderr,
      exitCode: data.run.code,
    });
  } catch (err) {
    console.error("Error executing Java code:", err.message);
    res.status(500).json({ error: "Code execution failed" });
  }
});



module.exports = router 