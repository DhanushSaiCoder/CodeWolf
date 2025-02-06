import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { Mode } from '../components/Mode';
import coder from '../images/coder.png';
import coder2 from '../images/coder2.png';
import { HomeLeaderBoard } from './../components/HomeLeaderBoard';
import { useSocket } from '../SocketContext'; // Import useSocket

const Home = () => {
    const navigate = useNavigate();
    const socket = useSocket(); // Access the socket

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/auth/login');
        } else if (socket) {  // Only emit if socket is not null
            const token = localStorage.getItem('token');
            socket.emit('sendToken', token);
        }
    }, [navigate, socket]);
    

    useEffect(() => {
        if (socket) {
            // Listen for events from the server
            socket.on('exampleEventResponse', (data) => {
                console.log(data);
            });

            // Cleanup on component unmount
            return () => {
                socket.off('exampleEventResponse');
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
