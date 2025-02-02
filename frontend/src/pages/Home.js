import React, { useEffect } from 'react';
import '../styles/Home.css'
import Header from '../components/Header';
const Home = () => {
    useEffect(() => {
        if(!localStorage.getItem('token')) window.location.href = '/auth/login'
    }, [])
    return (
        <>
            <Header />
            <div id='homeContent'>
                <h1>Welcome to the MERN Skeleton home page</h1>
            </div>
        </>
    );
}

export default Home;