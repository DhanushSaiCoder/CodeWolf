import React, { Component } from 'react';
import "../styles/Mode.css"

export const Mode = (props) => {
    const {modeName, modeImg, modeDescription, } = props
    return (
        <div className='mode'>
            <h2>{modeName}</h2>
        </div>
    );
}