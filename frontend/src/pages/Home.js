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
import { jwtDecode } from 'jwt-decode'; // Corrected import statement

const Home = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // To store current user's username

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    // Decode the token to get the username
    const decodedToken = jwtDecode(token); // Updated function name
    const username = decodedToken.username; // Ensure your token contains the 'username' field
    setCurrentUser(username);

    if (socket) {
      const handleConnect = () => {
        socket.emit('sendToken', token);
      };

      const handleOnlineUser = (username) => {
        console.log('User online:', username);

        // Exclude the current user
        if (username !== currentUser) {
          setOnlineUsers((prevUsers) => {
            // Avoid duplicates
            if (!prevUsers.includes(username)) {
              return [...prevUsers, username];
            }
            return prevUsers;
          });
        }
      };

      const handleOfflineUser = (username) => {
        console.log('User offline:', username);
        setOnlineUsers((prevUsers) =>
          prevUsers.filter((user) => user !== username)
        );
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
        <div className='onlineUsers'>
          <h3>Online Users:</h3>
          <ul>
            {onlineUsers.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
