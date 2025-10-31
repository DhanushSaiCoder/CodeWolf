import React from 'react';
import "../styles/MatchInfo.css";
import Profile from "../images/profile.jpg";
import { jwtDecode } from 'jwt-decode';

export default function MatchInfo({ matchDoc }) {
    if (matchDoc == "null") return <div className='MatchInfo'>Loading...</div>;

    let matchData;
    try {
        matchData = JSON.parse(matchDoc);
    } catch (error) {
        console.error("Error parsing matchDoc:", error);
        return <div className='MatchInfo'>Invalid Match Data</div>;
    }

    const {_id} = jwtDecode(localStorage.getItem('token'))
    const player = matchData.players[0].id == _id ? matchData.players[0] : matchData.players[1]
    const opponent = matchData.players[0].id == _id ? matchData.players[1] : matchData.players[0]

    return (
        <div className='MatchInfo'>
            <div className='MIPlayerDetails'>
                {/* Player One */}
                <div className='MIPlayerOneDetails bothPlayerDetails'>
                    <img className='profileImgs' src={Profile} alt="playerOne" width={75} height={75} />
                    <div>
                        <h2>{player?.username || "Unknown"}</h2>
                        <p>★ {player?.rating || "Unknown"}</p>
                    </div>
                </div>

                {/* VS */}
                <div className='vsDiv'>
                    <div className='vsCircle'><p>vs</p></div>
                </div>

                {/* Player Two */}
                <div className='MIPlayerTwoDetails bothPlayerDetails '>
                    <div>

                        <h2>{opponent?.username || "Unknown"}</h2>
                        <p>★ {opponent?.rating || "Unknown"}</p>

                    </div>
                    <img className='profileImgs' src={Profile} alt="playerTwo" width={75} height={75} />
                </div>
            </div>
        </div>
    );
}
