import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Friends.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { FriendList } from './../components/FriendList';
import { useSocket } from '../SocketContext'; // Import useSocket


const Friends = () => {
    const navigate = useNavigate();
    const socket = useSocket(); // Access the socket

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/auth/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/auth/login');
        } else if (socket) {  // Only emit if socket is not null
            const token = localStorage.getItem('token');
            socket.emit('sendToken', token);
        }
    }, [navigate, socket]);

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
