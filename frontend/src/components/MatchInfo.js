import React from 'react';
import "../styles/MatchInfo.css";
import Profile from "../images/profile.jpg";

export default function MatchInfo({ matchDoc }) {
    if (matchDoc == "null") return <div className='MatchInfo'>Loading...</div>;

    let matchData;
    try {
        matchData = JSON.parse(matchDoc);
    } catch (error) {
        console.error("Error parsing matchDoc:", error);
        return <div className='MatchInfo'>Invalid Match Data</div>;
    }

    return (
        <div className='MatchInfo'>
            <div className='MIPlayerDetails'>
                {/* Player One */}
                <div className='MIPlayerOneDetails bothPlayerDetails'>
                    <img className='profileImgs' src={Profile} alt="playerOne" width={60} height={60} />
                    <div>
                        <h2>{matchData.players[0]?.username || "Unknown"}</h2>
                        <p>★ {matchData.players[0]?.rating || "Unknown"}</p>
                    </div>
                </div>

                <div className='vsDiv'>
                    <div className='vsCircle'><p>vs</p></div>
                </div>

                {/* Player Two */}
                <div className='MIPlayerTwoDetails bothPlayerDetails '>
                    <div>

                        <h2>{matchData.players[1]?.username || "Unknown"}</h2>
                        <p>★ {matchData.players[1]?.rating || "Unknown"}</p>

                    </div>
                    <img className='profileImgs' src={Profile} alt="playerTwo" width={60} height={60} />
                </div>
            </div>
        </div>
    );
}
