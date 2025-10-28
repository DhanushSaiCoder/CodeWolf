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


router.post('/py', async (req, res) => {
  const { code, question } = req.body;
  const testcases = question.test_cases;

  //create header import statements
  const extra_headers = question.extra_headers || [];
  let headers_str = ``
  if (extra_headers.length) {
    for (const header of extra_headers) {
      headers_str += `import ${header}\n`
    }
  }

  // sample test cases: 
  // "test_cases": [
  //   {
  //     "input": [
  //       2
  //     ],
  //     "expected_output": "Even",
  //     "_id": {
  //       "$oid": "69005fdd5816f84cdb79f455"
  //     }
  //   }
  // ]

  let test_cases_in_py = `\ntest_cases = [\n`;

  for (const tc of testcases) {
    const inputValue = Array.isArray(tc.input)
      ? JSON.stringify(tc.input) // Convert array properly
      : JSON.stringify([tc.input]); // Ensure it's always a list in Python

    const expectedValue = JSON.stringify(tc.expected_output);

    test_cases_in_py += `{\n    "input": ${inputValue},\n    "expected_output": ${expectedValue}\n  },\n`;
  }

  test_cases_in_py += `]`;

  

  //generate harness: use fields like- function_name, parameters, test_cases from question. 
  let harness = `
${headers_str}

${code}

#--test code goes here--
${test_cases_in_py}

  `
  //use piston api to run the code harness

  // return the same json from /js route
  res.send(JSON.stringify(harness))
})

module.exports = router