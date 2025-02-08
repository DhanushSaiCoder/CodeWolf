// Home.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { Mode } from '../components/Mode';
import coder from '../images/coder.png';
import coder2 from '../images/coder2.png';
import { HomeLeaderBoard } from '../components/HomeLeaderBoard';
import { useSocket } from '../SocketContext';
import jwtDecode from 'jwt-decode';

const Home = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    if (socket) {
      const handleConnect = () => {
        socket.emit('sendToken', token);
      };

      socket.on('connect', handleConnect);

      // If already connected, emit token immediately
      if (socket.connected) {
        handleConnect();
      }

      // Cleanup function
      return () => {
        socket.off('connect', handleConnect);
      };
    }
  }, [navigate, socket]);

  return (
    <div className='Home'>
      <Header />
      <div className='homeContent'>
        <Nav currPage='home' />
        <div className='modesContainer'>
          <Mode
            modeName='QUICK DEBUG MODE'
            modeImg={coder}
            modeImg2={coder2}
            modeDescription='Resolve all errors in the provided code faster than your opponent within the allocated time.'
          />
        </div>
        <div className='homeLeaderBoardContainer'>
          <HomeLeaderBoard />
        </div>
      </div>
    </div>
  );
};

export default Home;
