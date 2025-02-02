import React, { Component } from 'react';
import "../styles/Nav.css"
import NavButton from './NavButton';
const Nav = (props) => {
    const { currPage } = props
    return (
        <div className="Nav">
            <NavButton pos="first" to="home" currPage={currPage}/>
            <NavButton to="friends" currPage={currPage}/>
            <NavButton to="history"  currPage={currPage}/>
            <NavButton to="leaderboard" currPage={currPage}/>
            <NavButton pos="last" to="settings" currPage={currPage}/>
        </div>
    );
}

export default Nav;