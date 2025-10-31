import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, History, Trophy, Settings } from 'lucide-react';

import "../styles/NavButton.css";

const NavButton = (props) => {
    const navigate = useNavigate();
    const { to, currPage, pos} = props;
    let toUrl = to === "home" ? '/' : `/${to}`

    let btnClassName = 'NavButton';

    if (pos === 'first') btnClassName += " firstBtn";
    else if (pos === 'last') btnClassName += " lastBtn";

    if (currPage === to) btnClassName += " activeBtn";

    const iconMapping = {
        home: <Home />,
        friends: <Users />,
        history: <History />,
        leaderboard: <Trophy />,
        settings: <Settings />
    };

    return (
        <button
            className={btnClassName}
            onClick={() => { navigate(toUrl) }}
        >
            {iconMapping[to]}
            <span className="nav-text">{to.toUpperCase()}</span>
        </button>
    );
}

export default NavButton;
