import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/History.css';
import Header from '../components/Header';
import Nav from '../components/Nav';

const History = () => {
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
                <Nav currPage="history" />
            </div>
        </div>
    );
}

export default History;
