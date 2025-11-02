import React, { useState } from 'react'
import "../styles/MatchRightColumn.css"
import CodeEditor from './CodeEditor';
import Output from './Output';
import HorizontalMenu from './HorizontalMenu';
import TestCases from './TestCases';

export default function MatchRightColumn(props) {
  const { matchDoc, question, handleUserWonMatch, timeUp,  matchLost, userWonMatch, handleGotWinnerRatingChange, isMobile } = props;
  const [output, setOutput] = useState(null)
  const [tabToShow, setTabToShow] = useState("output")
  const [submitResults, setSubmitResults] = useState(null)
  const [menuOpened, setMenuOpened] = useState(false)

  const handleCodeOutput = (output) => {
    setOutput(output)
  }

  const handleToggleTab = (activeTab) => {
    setTabToShow(activeTab)
  }

  const handleSubmitResults = (res) => {
    setSubmitResults(res)
  }

  const toggleOpenMenu = () => {
    setMenuOpened(!menuOpened)
  }
  return (
    <div className='MatchRightColumn'>
      <CodeEditor isMobile={isMobile} timeUp={timeUp} matchDoc={matchDoc} question={question} handleCodeOutput={handleCodeOutput} handleSubmitResults={handleSubmitResults} handleUserWonMatch={handleUserWonMatch}  matchLost={matchLost} userWonMatch={userWonMatch} handleGotWinnerRatingChange={handleGotWinnerRatingChange}/>
      <HorizontalMenu toggleOpenMenu={toggleOpenMenu} isMobile={isMobile} handleToggleTab={handleToggleTab} />
      <div className={`output_or_testcases_section ${menuOpened ? 'opened' : 'closed'}`}>
      {
        tabToShow == "output" ?
        (<Output output={output} />) :
        (<TestCases submitResults={submitResults} matchDoc={matchDoc} questionDoc={question}/>)
      }
      </div>
    </div>
  )
}
