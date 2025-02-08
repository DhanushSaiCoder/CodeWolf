// Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { Mode } from '../components/Mode';
import coder from '../images/coder.png';
import coder2 from '../images/coder2.png';
import { HomeLeaderBoard } from '../components/HomeLeaderBoard';
import { useSocket } from '../SocketContext';
import { jwtDecode } from 'jwt-decode'; // Use named import

const Home = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    const decodedToken = jwtDecode(token); // Use 'jwtDecode' function
    setCurrentUser(decodedToken.username);

    // Fetch initial friends list
    const fetchFriends = async () => {
      try {
        const response = await fetch(`http://localhost:3001/friends/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setFriends(data.friends); // Assuming the response contains a 'friends' array
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();

    if (socket) {
      const handleConnect = () => {
        socket.emit('sendToken', token);
      };

      const handleStatusUpdate = ({ userId, status }) => {
        setFriends((prevFriends) =>
          prevFriends.map((friend) =>
            friend.id === userId ? { ...friend, status } : friend
          )
        );
      };

      socket.on('connect', handleConnect);
      socket.on('statusUpdate', handleStatusUpdate);

      // If already connected, emit token immediately
      if (socket.connected) {
        handleConnect();
      }

      // Cleanup function
      return () => {
        socket.off('connect', handleConnect);
        socket.off('statusUpdate', handleStatusUpdate);
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

        {/* Display friends list with real-time status */}
        <div className='friendsList'>
          <h3>Your Friends</h3>
          <ul>
            {friends.map((friend) => (
              <li key={friend.id}>
                {friend.username} - <strong>{friend.status}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
