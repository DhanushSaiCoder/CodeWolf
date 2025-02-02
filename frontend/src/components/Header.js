import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import codeWolf from '../images/codeWolf.jpg';

const Header = () => {
    const navigate = useNavigate();

    const handleNavigation = () => {
        navigate('/');
    };

    return (
        <div className="header">
            <img

                onClick={handleNavigation}
                className="logo"
                src={codeWolf}
                alt="logo"
            />
            <h1 className='headerH1' onClick={handleNavigation}>Code Wolfs</h1>
        </div>
    );
};

export default Header;
