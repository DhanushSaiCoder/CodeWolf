import React from 'react'
import "../styles/MatchLeftColumn.css"
import MatchInfo from './MatchInfo';
import Timer from './Timer';
import QuestionDetails from './QuestionDetails';

export default function MatchLeftColumn(props) {
  const { matchDoc } = props;

  return (
    <div className='MatchLeftColumn'>
      <MatchInfo matchDoc={matchDoc} />
      <Timer time={15} />
      <QuestionDetails />
    </div>
  )
}
