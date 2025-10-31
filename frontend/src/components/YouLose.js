import React from 'react';
import "../styles/YouLose.css"
import { jwtDecode } from 'jwt-decode';
import youLoseImg from "../images/youlose.png"

const YouLose = ({ matchDoc, loser_rating_delta, handle_continueSolvingClick, handle_goHomeClick, handleCloseYouLose }) => {
    if (!matchDoc) {
        return null; // Or a loading indicator
    }
    const { _id: userId } = jwtDecode(localStorage.getItem('token'))
    const player_rating = matchDoc.players[0].id == userId ? matchDoc.players[0].rating : matchDoc.players[1].rating

    return (
        <div className='YouLose__container'>
            <div className='YouLose'>
                <div className='youlose_inner_div'>
                    <div onClick={handleCloseYouLose} className='closeYouWinBtn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </div>
                    <p>Your opponent solved the challenge first.</p>
                    <img src={youLoseImg} alt="youlosepic" id='youlose_img' />
                    <div className='youlose_rating_change_div'>
                        <h1>
                            {/* <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 25 25" fill="none" stroke="#fc3503" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down-icon lucide-trending-down"><path d="M16 17h6v-6" /><path d="m22 17-8.5-8.5-5 5L2 7" />
                            </svg> */}
                            &#8902; {player_rating + loser_rating_delta}
                        </h1>
                        <p className='youLose_rating_diff'>({loser_rating_delta})</p>
                    </div>
                    <div className='youlose_cta_div'>
                        <button onClick={handle_goHomeClick} className='youlose_cta_btn'>Go Home</button>
                        <button onClick={handle_continueSolvingClick} className='youlose_cta_btn youlose_cta_btn_positive'>Continue Solving</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default YouLose;
