import React, { useEffect, useState } from 'react';

const TestCases = ({submitResults}) => {
    const [results, setResults] = useState(null)

    useEffect(() => {
        console.log("submit results: ", submitResults)
        if(submitResults) setResults(submitResults)
    }, [submitResults])

    return (
        <div>
            <p>this is testcases section</p>
            <p>{results?.success ? "success" : "failure"}</p>
        </div>
    );
}

export default TestCases;
