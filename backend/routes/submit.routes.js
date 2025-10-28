const express = require('express')
const router = express.Router()
const { VM } = require('vm2');

router.post('/js', async (req, res) => {
  const { code, question } = req.body;
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
    let all_PASS = true;

    for (const testcase of results)
      if (testcase.result != "PASS") all_PASS = false

    res.json({ success: true, results, all_PASS });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/c', async (req, res) => {
  const { code, question } = req.body;
  const testcases = question.test_cases;
  const extra_headers = question.extra_headers || [];

  let header_includes = "";

  if (extra_headers.length) {
    header_includes = extra_headers
      .map(header => `#include <${header}>`)
      .join('\n');
  }

  const harness = `
    #include <stdio.h>
    //extra headers comes here
    ${header_includes}


    int main(){
      //we run the tests with testcases here
      
      return 0;
    }

    // user function comes here
    ${code}
  `

  res.json({harness_code: harness})
})


module.exports = router