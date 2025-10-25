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
            <div className='Output_header'>
                <h3>
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-terminal-icon lucide-terminal"><path d="M12 19h8" /><path d="m4 17 6-6-6-6" /></svg>
                    </span> Output
                </h3>
            </div>

            <div className='Output_content'>
                {error && <p id='errorEle'>{output?.error}</p>}
                <pre id="outputEle"><code>{output?.output}</code></pre>
            </div>
        </div>
    );
}

export default Output;
