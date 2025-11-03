import React from 'react';
import "../styles/MatchInfo.css";
import Profile from "../images/profile.jpg";
import { jwtDecode } from 'jwt-decode';

export default function MatchInfo({ matchDoc }) {
    if (!matchDoc) return <div className='MatchInfo'>Loading...</div>;

    const { _id } = jwtDecode(localStorage.getItem('token'))
    const player = matchDoc.players[0].id == _id ? matchDoc.players[0] : matchDoc.players[1]
    const opponent = matchDoc.players[0].id == _id ? matchDoc.players[1] : matchDoc.players[0]

    const player_lowQualityPic = player.profilePic?.replace(
        "/upload/",
        "/upload/q_auto:low,w_100,h_100,c_fill/"
    );

    const opponent_lowQualityPic = opponent.profilePic?.replace(
        "/upload/",
        "/upload/q_auto:low,w_100,h_100,c_fill/"
    )

    return (
        <div className='MatchInfo'>
            <div className='MIPlayerDetails'>
                {/* Player One */}
                <div className='MIPlayerOneDetails bothPlayerDetails'>
                    <img className='profileImgs' src={player_lowQualityPic || Profile} alt="playerOne" width={75} height={75} />
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
                    <img className='profileImgs' src={opponent_lowQualityPic || Profile} alt="playerTwo" width={75} height={75} />
                </div>
            </div>
        </div>
    );
}
