import React, { Component } from 'react';
import "../styles/Nav.css"

const Nav = (props) => {
    const {currPage} = props
    return (
        <div className="Nav">{currPage}</div>

    );
}

export default Nav;