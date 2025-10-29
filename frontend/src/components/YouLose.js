import React from 'react';
import "../styles/YouLose.css"
import youLoseImg from "../images/youlose.png"

const YouLose = () => {
    return (
        <div className='YouLose__container'>
            <div className='YouLose'>
                <div className='youlose_inner_div'>
                    <p>Your opponent solved the challenge first.</p>
                    <img src={youLoseImg} alt="youlosepic" id='youlose_img' />
                    <div className='youlose_rating_change_div'>
                        <h1>
                            {/* <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 25 25" fill="none" stroke="#fc3503" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down-icon lucide-trending-down"><path d="M16 17h6v-6" /><path d="m22 17-8.5-8.5-5 5L2 7" />
                            </svg> */}
                            &#8902; 1422
                        </h1>
                        <p className='rating_diff'>(-24)</p>
                    </div>
                    <div className='youlose_cta_div'>
                        <button className='youlose_cta_btn'>Go Home</button>
                        <button className='youlose_cta_btn youlose_cta_btn_positive'>Continue Solving</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default YouLose;
