import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Mode.css";

export const Mode = (props) => {
    const navigate = useNavigate();
    const { modeName, modeImg, modeImg2, modeDescription } = props;

    return (
        <div className='mode'>
            <h2>{modeName}</h2>
            <div className='imgsDiv'>
                <img className='imgLeft' src={modeImg} alt="Mode representation" />
                <h3>{'< vs >'}</h3>
                <img className='imgRight' src={modeImg2} alt="Mode representation" />
            </div>
            <div className='modeDescriptionDiv'>
                <p className='modeDescriptionText'><i>{modeDescription}</i></p>
            </div>
            <div className='modeBtnsDiv'>
                <button className='modeBtns quickMatchBtn'><b>QUICK MATCH</b></button>
                <button
                    onClick={() => navigate('/friends')}
                    className='modeBtns inviteFriendBtn'
                >
                    <b>INVITE FRIEND</b>
                </button>
            </div>
        </div>
    );
};
