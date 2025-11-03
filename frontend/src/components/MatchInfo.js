import React from 'react';
import "../styles/MatchInfo.css";
import Profile from "../images/profile.jpg";
import { jwtDecode } from 'jwt-decode';
import { Swords } from "lucide-react"
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
                    <img className='profileImgs' src={player_lowQualityPic || Profile} alt="playerOne" />
                    <div>
                        <h2>{player?.username || "Unknown"}</h2>
                        <p>★ {player?.rating || "Unknown"}</p>
                    </div>
                </div>

                {/* VS */}
                <div className='vsDiv'>
                    <div className='vsCircle'><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d5bcf5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-swords-icon lucide-swords"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg></div>
                </div>

                {/* Player Two */}
                <div className='MIPlayerTwoDetails bothPlayerDetails '>
                    <img className='profileImgs' src={opponent_lowQualityPic || Profile} alt="playerTwo" />
                    <div className='MIPlayerTwoDetails_details'>

                        <h2>{opponent?.username || "Unknown"}</h2>
                        <p>★ {opponent?.rating || "Unknown"}</p>

                    </div>
                </div>
            </div>
        </div>
    );
}
