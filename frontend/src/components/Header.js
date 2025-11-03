import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import '../styles/Header.css';
import codeWolf from '../images/codeWolf.jpg';

const Header = ({ onNavToggle }) => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavigation = () => {
        window.location.href = "/"
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleHamburgerClick = () => {
        onNavToggle();
        toggleMobileMenu();
    };

    const handleLogOut = () => {
        if (!window.confirm("Are you sure?")) return
        window.localStorage.removeItem('token')
        navigate('/auth/login')
    }

    return (
        <div className="header">
            <img
                onClick={handleNavigation}
                className="logo"
                src={codeWolf}
                alt="logo"
            />
            <h1 className='headerH1' onClick={handleNavigation}>Code Wolf</h1>
            <div className='headerLinks'>
                <button className='logoutBtn' onClick={handleLogOut}>LOG OUT</button>
            </div>
            <div className="hamburger-menu" onClick={handleHamburgerClick}>
                <Menu />
            </div>
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <button className='logoutBtn' onClick={handleLogOut}>LOG OUT</button>
                </div>
            )}
        </div>
    );
};

export default Header;
