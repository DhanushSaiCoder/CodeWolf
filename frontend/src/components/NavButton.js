import React from 'react';
import "../styles/NavButton.css";

const NavButton = (props) => {
    const { to, currPage, pos } = props;

    let btnClassName = 'NavButton';

    if (pos === 'first') btnClassName += " firstBtn";
    else if (pos === 'last') btnClassName += " lastBtn";

    if (currPage === to) btnClassName += " activeBtn";

    return (
        <button className={btnClassName}>
            {to.toUpperCase()}
        </button>
    );
}

export default NavButton;
