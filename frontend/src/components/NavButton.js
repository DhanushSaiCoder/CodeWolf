import React from 'react';
import { useNavigate } from 'react-router-dom';

import "../styles/NavButton.css";

const NavButton = (props) => {
    const navigate = useNavigate();
    const { to, currPage, pos} = props;
    let toUrl = to === "home" ? '/' : `/${to}`

    let btnClassName = 'NavButton';

    if (pos === 'first') btnClassName += " firstBtn";
    else if (pos === 'last') btnClassName += " lastBtn";

    if (currPage === to) btnClassName += " activeBtn";

    return (
        <button
            className={btnClassName}
            onClick={() => { navigate(toUrl) }}
        >
            {to.toUpperCase()}
        </button>
    );
}

export default NavButton;
