import React, { useState } from 'react'
import "../styles/MatchRightColumn.css"
import CodeEditor from './CodeEditor';
import Output from './Output';
import HorizontalMenu from './HorizontalMenu';

export default function MatchRightColumn(props) {
  const { matchDoc, question } = props;
  const [output, setOutput] = useState(null)

  const handleCodeOutput = (output) => {
    setOutput(output)
  }

  return (
    <div className='MatchRightColumn'>
      <CodeEditor matchDoc={matchDoc} question={question} handleCodeOutput={handleCodeOutput} />
      <HorizontalMenu />
      <Output output={output} />
    </div>
  )
}
