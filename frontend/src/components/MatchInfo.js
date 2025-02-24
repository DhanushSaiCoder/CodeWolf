import React from 'react'
import "../styles/MatchInfo.css"
export default function MatchInfo(props) {
    const { matchDoc } = props;
    return (
        <div className='MatchInfo'>{matchDoc}</div>
    ) 
}
