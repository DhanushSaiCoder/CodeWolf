import React, { useEffect, useState } from 'react';
import "../styles/Output.css"


const Output = ({ output }) => {
    const [error, setError] = useState(null)


    useEffect(() => {
        if(output && output.error != null) setError(output.error)
        else setError(null)
    }, [output])

    return (
        <div className='Output'>
            

            <div className='Output_content'>
                {error && <p id='errorEle'>{output?.error}</p>}
                <pre id="outputEle"><code>{output?.output}</code></pre>
            </div>
        </div>
    );
}

export default Output;
