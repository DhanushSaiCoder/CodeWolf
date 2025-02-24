import React from 'react'
import "../styles/MatchRightColumn.css"
export default function MatchRightColumn(props) {
  const { matchDoc } = props;
  return (
    <div className='MatchRightColumn'>{matchDoc}</div>
  )
}
