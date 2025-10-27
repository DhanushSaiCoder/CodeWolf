import React, { useEffect, useState } from 'react';
import "../styles/TestCases.css"

const TestCases = ({ submitResults, matchDoc, questionDoc }) => {
    const [results, setResults] = useState(null)
    const [totalTestCasesPassedCount, setTotalTestCasesPassedCount] = useState(-1)
    const [firstFailedTestCase, setFirstFailedTestCase] = useState(-1)

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

    function totalTestCasesPassed(submitResults, test_cases){
        const results = submitResults.results
        let count = 0;
        for(const testcase of results){
            if(testcase.result == "PASS") count++
        }
        return count
    }

    function findFirstFailedTestCase(submitResults, test_cases){
        let index = 0;
        for(const testcase of submitResults.results){
            if(testcase.result == "FAIL") return index
            index++
        }
        return -1
    }
    
    // console.log("submitResults: ", submitResults)
    // console.log("test_cases: ", test_cases)

    useEffect(() => {
        if (submitResults) {
            setTotalTestCasesPassedCount(totalTestCasesPassed(submitResults, test_cases))

            const failedTestCaseIndex = findFirstFailedTestCase(submitResults, test_cases)
            if(failedTestCaseIndex != -1) {
                // console.log("failed testcase: ", test_cases[failedTestCaseIndex])
                setFirstFailedTestCase(test_cases[failedTestCaseIndex])
            }
            
            setResults(submitResults)
        }
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
            <p className='submit_result_summary'>Only <strong>{totalTestCasesPassedCount}/{test_cases.length}</strong> testcases passed</p>
            <div className='TestCases_failed_testCase_container'>
                <p>Failed Testcase: </p>
                <div className='TestCases_failed_testCase'>
                    <div className='TestCases_failed_testCase_input console_like_divs'>
                        <p>Input: <code>{JSON.stringify(firstFailedTestCase.input)}</code></p>
                    </div>
                    <div className='TestCases_failed_testCase_expected_output console_like_divs'>
                        <p>Expected Output:  <code>{JSON.stringify(test_cases[findFirstFailedTestCase(submitResults, test_cases)].expected_output)}</code></p>
                    </div>
                    <div className='TestCases_failed_testCase_actual_output console_like_divs'>
                        <p>Actual Output:  <code>{JSON.stringify(submitResults.results[findFirstFailedTestCase(submitResults, test_cases)].output)}</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TestCases;
