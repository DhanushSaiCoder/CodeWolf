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
import { jwtDecode } from 'jwt-decode';
import { MatchRequest } from '../components/MatchRequest';

const Home = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [matchRequestData, setMatchRequestData] = useState(null);
  const [rejectCountdown, setRejectCountdown] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    // Decode the token and set the current user (for display purposes)
    const decodedToken = jwtDecode(token);
    setCurrentUser(decodedToken.username);

    // Fetch the initial friends list
    const fetchFriends = async () => {
      try {
        const response = await fetch(`http://localhost:5000/friends/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setFriends(data.friends);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();

    if (socket) {
      // Called when the socket connects (the token is already passed in the handshake)
      const handleConnect = () => {
        console.log('Socket connected.');
      };

      // Update friends’ online/offline status when received from the server
      const handleStatusUpdate = ({ userId, status }) => {
        setFriends((prevFriends) =>
          prevFriends.map((friend) =>
            friend.id === userId ? { ...friend, status } : friend
          )
        );
      };

      // Listen for incoming match requests
      const handleMatchRequest = (data) => {
        console.log('Received match request:', data);
        setMatchRequestData(data);

        // Automatically reject the match request after 10 seconds if no action is taken
        setTimeout(() => {
          if (data && socket) {
            console.log('Auto-rejecting match request:', data);
            socket.emit('requestRejected', data);
          }
          setMatchRequestData(null);
        }, 10000);
      };

      socket.on('connect', handleConnect);
      socket.on('statusUpdate', handleStatusUpdate);
      socket.on('sendMatchRequest', handleMatchRequest);

      // If already connected, immediately call handleConnect
      if (socket.connected) {
        handleConnect();
      }

      // Cleanup event listeners when the component unmounts or socket changes
      return () => {
        socket.off('connect', handleConnect);
        socket.off('statusUpdate', handleStatusUpdate);
        socket.off('sendMatchRequest', handleMatchRequest);
      };
    }
  }, [navigate, socket]);

  // Manage the auto-reject countdown for match requests
  useEffect(() => {
    if (matchRequestData) {
      setRejectCountdown(10);
      const interval = setInterval(() => {
        setRejectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [matchRequestData]);

  // Handler for accepting a match request
  const handleAccept = () => {
    console.log('Match accepted!');
    // Add your accept logic (e.g., navigating to the match page) here...
    setMatchRequestData(null);
  };

  // Handler for rejecting a match request
  const handleReject = () => {
    if (socket && matchRequestData) {
      console.log('Match rejected!');
      socket.emit('requestRejected', matchRequestData);
    }
    setMatchRequestData(null);
  };

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
      {/* Render the MatchRequest component if there is an incoming match request */}
      <MatchRequest
        matchRequestData={matchRequestData}
        rejectCountdown={rejectCountdown}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </div>
  );
};

export default Home;
