import React, { act, useState } from 'react'
import "../styles/MatchRightColumn.css"
import CodeEditor from './CodeEditor';
import Output from './Output';
import HorizontalMenu from './HorizontalMenu';
import TestCases from './TestCases';

export default function MatchRightColumn(props) {
  const { matchDoc, question, handleUserWonMatch, timeUp,  matchLost, userWonMatch, handleGotWinnerRatingChange } = props;
  const [output, setOutput] = useState(null)
  const [tabToShow, setTabToShow] = useState("output")
  const [submitResults, setSubmitResults] = useState(null)

  const handleCodeOutput = (output) => {
    setOutput(output)
  }

  const handleToggleTab = (activeTab) => {
    setTabToShow(activeTab)
  }

  const handleSubmitResults = (res) => {
    setSubmitResults(res)
  }
  return (
    <div className='MatchRightColumn'>
      <CodeEditor timeUp={timeUp} matchDoc={matchDoc} question={question} handleCodeOutput={handleCodeOutput} handleSubmitResults={handleSubmitResults} handleUserWonMatch={handleUserWonMatch}  matchLost={matchLost} userWonMatch={userWonMatch} handleGotWinnerRatingChange={handleGotWinnerRatingChange}/>
      <HorizontalMenu handleToggleTab={handleToggleTab} />
      <div className='output_or_testcases_section'>
      {
        tabToShow == "output" ?
        (<Output output={output} />) :
        (<TestCases submitResults={submitResults} matchDoc={matchDoc} questionDoc={question}/>)
      }
      </div>
    </div>
  )
}
