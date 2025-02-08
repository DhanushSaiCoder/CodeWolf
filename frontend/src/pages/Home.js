// Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { Mode } from '../components/Mode';
import coder from '../images/coder.png';
import coder2 from '../images/coder2.png';
import { HomeLeaderBoard } from './../components/HomeLeaderBoard';
import { useSocket } from '../SocketContext';
import { jwtDecode } from 'jwt-decode';

const Home = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    const decodedToken = jwtDecode(token);
    const username = decodedToken.username;
    setCurrentUser(username);

    if (socket) {
      const handleConnect = () => {
        socket.emit('sendToken', token);
      };

      const handleOnlineUser = async (username) => {
        console.log('User online:', username);
        try {
          const response = await fetch(`http://localhost:5000/friends/online/${decodedToken._id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();
          console.log('Online status updated:', data);
        } catch (error) {
          console.error('Error updating online status:', error);
        }
      };

      const handleOfflineUser = async (username) => {
        console.log('User offline:', username);
        try {
          const response = await fetch(`http://localhost:3001/friends/online/${username}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'offline' }),
          });

          const data = await response.json();
          console.log('Offline status updated:', data);
        } catch (error) {
          console.error('Error updating offline status:', error);
        }
      };

      // Attach event listeners
      socket.on('connect', handleConnect);
      socket.on('onlineUser', handleOnlineUser);
      socket.on('offlineUser', handleOfflineUser);

      // If already connected, emit token immediately
      if (socket.connected) {
        handleConnect();
      }

      // Cleanup function
      return () => {
        socket.off('connect', handleConnect);
        socket.off('onlineUser', handleOnlineUser);
        socket.off('offlineUser', handleOfflineUser);
      };
    }
  }, [navigate, socket, currentUser]);

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
        {/* Removed online users list */}
      </div>
    </div>
  );
};

export default Home;
