import React from 'react'
import "../styles/MatchRightColumn.css"
import CodeEditor from './CodeEditor';

export default function MatchRightColumn(props) {
  const { matchDoc } = props;
  return (
    <div className='MatchRightColumn'>
      <CodeEditor matchDoc={matchDoc} />
    </div>
  )
}
