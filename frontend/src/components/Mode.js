import React, { Component } from 'react';
import "../styles/Mode.css"
import hands from "../images/hands.png"

export const Mode = (props) => {
    const {modeName, modeImg, modeDescription, } = props
    return (
        <div className='mode'>
            <h2>{modeName}</h2>
            <div className='imgsDiv'>
                <img className='imgLeft' src={modeImg} alt="modeImg" />
                <img className='imgCenter' src={hands} alt="handsImg" />
                <img className='imgRight' src={modeImg} alt="modeImg" />
            </div>
            <div className='modeBtnsDiv'>
                <button className='modeBtns inviteFriendBtn'><b>INVITE FRIEND</b></button>
                <button className='modeBtns quickMatchBtn'><b>QUICK MATCH</b></button>
            </div>
            <div className='modeDescriptionDiv'>
                <p className='modeDescriptionText'><i>{modeDescription}</i></p>
            </div>
        </div>
    );
}