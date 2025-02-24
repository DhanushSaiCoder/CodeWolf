import React from 'react'
import "../styles/MatchLeftColumn.css"
import MatchInfo from './MatchInfo';
import Timer from './Timer';

export default function MatchLeftColumn(props) {
  const { matchDoc } = props;

  return (
    <div className='MatchLeftColumn'>
      <MatchInfo matchDoc={matchDoc} />
      <Timer/>

    </div>
  )
}
