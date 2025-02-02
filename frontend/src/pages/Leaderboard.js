import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Leaderboard.css';
import Header from '../components/Header';
import Nav from '../components/Nav';

const Leaderboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/auth/login');
        }
    }, [navigate]);

    return (
        <div className='Home'>
            <Header />
            <div className='homeContent'>
                <Nav currPage="leaderboard" />
            </div>
        </div>
    );
}

export default Leaderboard;
