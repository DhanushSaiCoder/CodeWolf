import React from 'react'
import "../styles/MatchLeftColumn.css"
import MatchInfo from './MatchInfo';
export default function MatchLeftColumn(props) {
  const { matchDoc } = props;

  return (
    <div className='MatchLeftColumn'>
      <MatchInfo matchDoc={matchDoc} />
    </div>
  )
}
