import React from 'react'
import "../styles/MatchRightColumn.css"
import CodeEditor from './CodeEditor';
import Output from './Output';

export default function MatchRightColumn(props) {
  const { matchDoc, question } = props;
  return (
    <div className='MatchRightColumn'>
      <CodeEditor matchDoc={matchDoc} question={question} />
      <Output/>
    </div>
  )
}
