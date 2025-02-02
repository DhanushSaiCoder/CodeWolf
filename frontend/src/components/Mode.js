import React from 'react';
import "../styles/Mode.css";

export const Mode = (props) => {
    const { modeName, modeImg,modeImg2, modeDescription } = props;
    return (
        <div className='mode'>
            <h2>{modeName}</h2>
            <div className='imgsDiv'>
                <img className='imgLeft' src={modeImg} alt="modeImg" />
                {/* <img className='imgCenter' src={hands} alt="handsImg" />
                 */}
                 <h3>{'< vs >'}</h3>
                <img className='imgRight' src={modeImg2} alt="modeImg" />
            </div>
            <div className='modeBtnsDiv'>
                <button className='modeBtns quickMatchBtn'><b>QUICK MATCH</b></button>
                <button className='modeBtns inviteFriendBtn'><b>INVITE FRIEND</b></button>
            </div>
            <div className='modeDescriptionDiv'>
                <p className='modeDescriptionText'><i>{modeDescription}</i></p>
            </div>
        </div>
    );
};
