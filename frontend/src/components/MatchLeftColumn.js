import React from 'react';
import "../styles/MatchLeftColumn.css";
import MatchInfo from './MatchInfo';
import Timer from './Timer';
import QuestionDetails from './QuestionDetails';

export default function MatchLeftColumn(props) {
  const { matchDoc, matchId } = props;

  return (
    <div className='MatchLeftColumn'>
      <MatchInfo matchDoc={matchDoc} />
      {/* Pass the current matchId to Timer */}
      <Timer matchId={matchId} time={15} /> {/* here time is duration in minutes */}
      <QuestionDetails />
    </div>
  );
}
