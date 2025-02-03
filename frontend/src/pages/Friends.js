import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Friends.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { FriendList } from './../components/FriendList';

const Friends = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/auth/login');
        }
    }, [navigate]);

    return (
        <div className='Friends'>
            <Header />
            <div className='friendsContent'>
                <Nav currPage="friends" />
                <div className='friendListDiv'>
                    <FriendList />
                </div>
            </div>
        </div>
    );
}

export default Friends;
