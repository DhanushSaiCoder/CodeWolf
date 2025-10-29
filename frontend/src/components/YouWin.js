import React from 'react';
import "../styles/YouWin.css"
import youWinImg from "../images/youwin.png"

const YouWin = () => {
    const handle_goHomeClick = () => {
        window.location.href = "/"
    }
    return (
        <div className='youWin__container'>
            <div className='youWin'>
                <div className='youWin_inner_div'>
                    <p>You solved the challenge before your opponent.</p>
                    <img src={youWinImg} alt="youwinpic" id='youWin_img' />
                    <div className='youWin_rating_change_div'>
                        <h1>
                            {/* <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 25 25" fill="none" stroke="#fc3503" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down-icon lucide-trending-down"><path d="M16 17h6v-6" /><path d="m22 17-8.5-8.5-5 5L2 7" />
                                </svg> */}
                            &#8902; 1422
                        </h1>
                        <p className='youWin_rating_diff'>(+13)</p>
                    </div>
                    <div className='youWin_cta_div'>
                        <button onClick={handle_goHomeClick} className='youWin_cta_btn'>Go Home</button>
                        <button className='youWin_cta_btn youWin_cta_btn_positive'>Spectate Opponent</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default YouWin;
