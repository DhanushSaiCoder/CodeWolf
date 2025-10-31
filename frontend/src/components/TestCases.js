import React from 'react';
import "../styles/TestCases.css"

const TestCases = ({ submitResults, questionDoc }) => {
    if (!questionDoc) {
        return (
            <div className='TestCases'>
                <p>Loading test cases...</p>
            </div>
        );
    }

    const { test_cases } = questionDoc;

    if (submitResults == null) {
        return (
            <div className='TestCases'>
                <p>Submit to get testcases </p>
            </div>
        );
    }

    // Case 1: Compile/Runtime Error
    if (submitResults.error || submitResults.stderr) {
        return (
            <div className='TestCases'>
                <p className='submit_result_summary error_summary'>Your code has an error:</p>
                <div className='TestCases_failed_testCase_container'>
                    <div className='TestCases_failed_testCase'>
                        <div className='TestCases_failed_testCase_actual_output console_like_divs'>
                            <pre><code>{submitResults.stderr || submitResults.error}</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Case 2: All test cases passed
    if (submitResults.all_PASS === true) {
        return (
            <div className='TestCases'>
                <p className='submit_result_summary success_testcases_summary'>All testcases passed, <a href="/">click here</a> to return to home page.</p>
            </div>
        );
    }

    // Case 3: Some test cases failed
    if (!Array.isArray(submitResults.results)) {
        return (
            <div className='TestCases'>
                <p>An unexpected error occurred with the submission results.</p>
            </div>
        );
    }

    const passedCount = submitResults.results.filter(r => r.result === "PASS").length;
    const firstFailedIndex = submitResults.results.findIndex(r => r.result === "FAIL");
    
    let firstFailedTestCase = null;
    let firstFailedActualOutput = null;

    if (firstFailedIndex !== -1) {
        firstFailedTestCase = test_cases[firstFailedIndex];
        firstFailedActualOutput = submitResults.results[firstFailedIndex].output;
    }

    return (
        <div className='TestCases'>
            <p className='submit_result_summary'>Only <strong>{passedCount}/{test_cases.length}</strong> testcases passed</p>
            
            {firstFailedTestCase && (
                <div className='TestCases_failed_testCase_container'>
                    <p>Failed Testcase: </p>
                    <div className='TestCases_failed_testcase'>
                        <div className='TestCases_failed_testCase_input console_like_divs'>
                            <p>Input: <code>{JSON.stringify(firstFailedTestCase.input)}</code></p>
                        </div>
                        <div className='TestCases_failed_testCase_expected_output console_like_divs'>
                            <p>Expected Output:  <code>{JSON.stringify(firstFailedTestCase.expected_output)}</code></p>
                        </div>
                        <div className='TestCases_failed_testCase_actual_output console_like_divs'>
                            <p>Actual Output:  <code>{JSON.stringify(firstFailedActualOutput)}</code></p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TestCases;