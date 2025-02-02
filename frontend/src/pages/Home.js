import React, { useEffect } from 'react';
import '../styles/Home.css'
import Header from '../components/Header';
import Nav from '../components/Nav';

const Home = () => {
    useEffect(() => {
        if(!localStorage.getItem('token')) window.location.href = '/auth/login'
    }, [])
    
    return (
        <div className='Home'>
            <Header />
            <div className='homeContent'>
                <Nav/>
            </div>
        </div>
    );
}

export default Home;