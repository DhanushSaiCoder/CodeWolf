import React, { act, useState } from 'react'
import "../styles/MatchRightColumn.css"
import CodeEditor from './CodeEditor';
import Output from './Output';
import HorizontalMenu from './HorizontalMenu';
import TestCases from './TestCases';

export default function MatchRightColumn(props) {
  const { matchDoc, question } = props;
  const [output, setOutput] = useState(null)
  const [tabToShow, setTabToShow] = useState("output")

  const handleCodeOutput = (output) => {
    setOutput(output)
  }

  const handleToggleTab = (activeTab) => {
    setTabToShow(activeTab == "output" ? "testcases" : "output")
  }
  return (
    <div className='MatchRightColumn'>
      <CodeEditor matchDoc={matchDoc} question={question} handleCodeOutput={handleCodeOutput} />
      <HorizontalMenu handleToggleTab={handleToggleTab} />
      {
        tabToShow == "output" ?
          (<Output output={output} />) :
          (<TestCases />)
      }
    </div>
  )
}
