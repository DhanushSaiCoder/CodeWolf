const express = require('express')
const router = express.Router()
const { VM } = require('vm2');

router.post('/js', async (req, res) => {
    const { code, question } = req.body;
    console.log("questionDoc: ", question)
    const testcases = question.test_cases;

    // Build the test harness dynamically
    const harness = `
    ${code} 
    const testcases = ${JSON.stringify(testcases)};
    const results = [];
    let index = 1;
    for (const testcase of testcases) {
      try {
        const result = ${question.function_name}(...testcase.input);
        const pass = JSON.stringify(result) === JSON.stringify(testcase.expected_output);
        results.push({ test_case_number: index, result: pass ? "PASS" : "FAIL", output: result });
      } catch (err) {
        results.push({ test_case_number: index, result: "ERROR", error: err.message });
      }
      index++;
    }
    results;
  `;

    try {
        const vm = new VM({ timeout: 1000, sandbox: {} });
        const results = vm.run(harness);

        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


module.exports = router