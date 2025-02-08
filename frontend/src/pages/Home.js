import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { Mode } from '../components/Mode';
import coder from '../images/coder.png';
import coder2 from '../images/coder2.png';
import { HomeLeaderBoard } from './../components/HomeLeaderBoard';
import { useSocket } from '../SocketContext';

const Home = () => {
    const navigate = useNavigate();
    const socket = useSocket();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/auth/login');
            return;
        }

        if (socket) {
            const handleConnect = () => {
                const token = localStorage.getItem('token');
                socket.emit('sendToken', token);
            };

            // Send token on connect and if already connected
            socket.on('connect', handleConnect);
            if (socket.connected) handleConnect();

            return () => {
                socket.off('connect', handleConnect);
            };
        }
    }, [navigate, socket]);

    useEffect(() => {
        if (socket) {
            const handleOnlineUser = (username) => {
                console.log("user online: ", username);
                alert(`user online: ${username}`);
            };

            socket.on('onlineUser', handleOnlineUser);

            return () => {
                socket.off('onlineUser', handleOnlineUser);
            };
        }
    }, [socket]);

    return (
        <div className='Home'>
            <Header />
            <div className='homeContent'>
                <Nav currPage="home" />
                <div className='modesContainer'>
                    <Mode
                        modeName="QUICK DEBUG MODE"
                        modeImg={coder}
                        modeImg2={coder2}
                        modeDescription="Resolve all errors in the provided code faster than your opponent within the allocated time."
                    />
                </div>
                <div className='homeLeaderBoardContainer'>
                    <HomeLeaderBoard />
                </div>
            </div>
        </div>
    );
}

export default Home;