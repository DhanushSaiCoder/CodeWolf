import React from 'react';
import "../styles/MatchLeftColumn.css";
import MatchInfo from './MatchInfo';
import Timer from './Timer';
import QuestionDetails from './QuestionDetails';

export default function MatchLeftColumn(props) {
  const { matchDoc, matchId, handleQuestionFound, handleTimeUp } = props;

  return (
    <div className='MatchLeftColumn'>
      <MatchInfo matchDoc={matchDoc} />
      {/* Pass the current matchId to Timer */}
      <Timer matchId={matchId} time={1} handleTimeUp={handleTimeUp}/> {/* here time is duration in minutes */}
      <QuestionDetails matchDoc={matchDoc} handleQuestionFound={handleQuestionFound} />
    </div>
  );
}
