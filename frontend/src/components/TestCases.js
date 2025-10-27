import React, { useEffect, useState } from 'react';
import "../styles/TestCases.css"

const TestCases = ({ submitResults, matchDoc, questionDoc }) => {
    const [results, setResults] = useState(null)
    const test_cases = questionDoc.test_cases

    //"test_cases": [
    //     {
    //       "input": [
    //         2
    //       ],
    //       "expected_output": true,
    //       "_id": {
    //         "$oid": "68ff4fa950f43f06355384c3"
    //       }
    //     }
    //   ],
    
    useEffect(() => {
        console.log("submit results: ", submitResults)
        if (submitResults) setResults(submitResults)
    }, [submitResults])

    if(submitResults == null) return (
        <div className='TestCases'>
            <p>Submit to get testcases </p>
        </div>
    )

    if(submitResults.all_PASS == true) return (
        <div className='TestCases'>
            <p className='submit_result_summary success_testcases_summary'>All testcases passed, <a href="/">click here</a> to return to home page.</p>
        </div>
    )
    return (
        <div className='TestCases'>
            <p className='submit_result_summary'>Only <strong>27/94</strong> testcases passed</p>
            <div className='TestCases_failed_testCase_container'>
                <p>Failed Testcase: </p>
                <div className='TestCases_failed_testCase'>
                    <div className='TestCases_failed_testCase_input console_like_divs'>
                        <p><strong>Input:</strong> <code>[3,6,1,0]</code></p>
                    </div>
                    <div className='TestCases_failed_testCase_expected_output console_like_divs'>
                        <p><strong>Expected Output: </strong> <code>34</code></p>
                    </div>
                    <div className='TestCases_failed_testCase_actual_output console_like_divs'>
                        <p><strong>Actual Output: </strong> <code>33</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TestCases;
