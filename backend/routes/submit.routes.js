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
  let imports_str = ``
  if (extra_headers.length) {
    for (const header of extra_headers) {
      imports_str += `import ${header}\n`
    }
  }


  //generate harness: use fields like- function_name, parameters, test_cases from question. 
  const harness = `
import json
${imports_str}

${code}

test_cases = ${JSON.stringify(testcases)}

results = []
index = 1

for t in test_cases:
    try:
        # Evaluate the input (e.g. "2", "(2,3)", "[1,2,3]")
        inp = eval(t["input"])
        if not isinstance(inp, tuple):
            inp = (inp,)
        result = ${question.function_name}(*inp)
        pass_case = result == t["expected_output"]
        results.append({
            "test_case_number": index,
            "result": "PASS" if pass_case else "FAIL",
            "output": result
        })
    except Exception as e:
        results.append({
            "test_case_number": index,
            "result": "ERROR",
            "error": str(e)
        })
    index += 1

print(json.dumps(results))
`;

  //use piston api to run the code harness
  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python",
        version: "*",
        files: [{ name: "main.py", content: harness }],
      }),
    });

    const data = await response.json();

    // Extract printed JSON results
    let results = [];
    try {
      results = JSON.parse(data.run.output);
    } catch {
      results = [
        {
          test_case_number: 0,
          result: "ERROR",
          error: "Failed to parse output",
          raw_output: data.run.output,
        },
      ];
    }

    // Compute all_PASS
    const all_PASS = results.every((t) => t.result === "PASS");

    res.json({
      success: true,
      all_PASS,
      results,
    });
  } catch (err) {
    console.error("Error executing Python code:", err.message);
    res.status(500).json({
      success: false,
      error: "Python code execution failed",
    });
  }
})

module.exports = router