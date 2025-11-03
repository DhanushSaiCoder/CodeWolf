import React, { useState } from 'react';
import "../styles/MatchLeftColumn.css";
import MatchInfo from './MatchInfo';
import Timer from './Timer';
import QuestionDetails from './QuestionDetails';

export default function MatchLeftColumn(props) {
  const { matchDoc, matchId, handleQuestionFound, handleTimeUp, showTimer, matchCompleted } = props;

  return (
    <div className='MatchLeftColumn'>
      <MatchInfo matchDoc={matchDoc} />
      {/* Pass the current matchId to Timer */}
      {showTimer && !matchCompleted && (<Timer matchId={matchId} time={matchDoc.duration / 60} handleTimeUp={handleTimeUp} />)}
      <QuestionDetails matchDoc={matchDoc} handleQuestionFound={handleQuestionFound} />
    </div>
  );
}
