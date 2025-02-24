import React from 'react'
import "../styles/MatchLeftColumn.css"

export default function MatchLeftColumn(props) {
  const { matchDoc } = props;

  return (
    <div className='MatchLeftColumn'>{matchDoc}</div>
  )
}
