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
import { HomeHistory } from '../components/HomeHistory';
import { useSocket } from '../SocketContext';
import { jwtDecode } from 'jwt-decode';
import MatchSetupPopup from '../components/MatchSetupPopup';

const Home = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [matchRequestData, setMatchRequestData] = useState(false);
  const [rejectCountdown, setRejectCountdown] = useState(10);
  const [isNavOpen, setIsNavOpen] = useState(false); // New state for Nav visibility
  const [showMatchSetup, setShowMatchSetup] = useState(false);
  const [matchSettings, setMatchSettings] = useState({
    programmingLanguage: 'js',
    difficulty: 'easy',
    mode: ''
  });

  const handleQuickMatchClick = (modeValue) => {
    setMatchSettings(prev => ({ ...prev, mode: modeValue }));
    setShowMatchSetup(true);
  };

  const handleCloseMatchSetup = () => {
    setShowMatchSetup(false);
  };

  const handleMatchSettingsChange = (e) => {
    const { name, value } = e.target;
    setMatchSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleMatchSetupSubmit = (e) => {
    e.preventDefault();
    setShowMatchSetup(false);
    navigate(`/findMatch?mode=${matchSettings.mode}&difficulty=${matchSettings.difficulty}&language=${matchSettings.programmingLanguage}`);
  };


  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

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
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/friends/list`, {
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
        setMatchRequestData(data);

        // Automatically reject the match request after 10 seconds if no action is taken
        setTimeout(() => {
          if (data && socket) {
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
        setRejectCountdown(prev => {
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
    // Add your accept logic here (e.g., notify the server, redirect to match page, etc.)

    socket.emit('requestAccepted', matchRequestData);
    navigate(`/matchwait/?requesterId=${matchRequestData.requesterId}&receiverId=${matchRequestData.userId}&mode=${encodeURI(matchRequestData.mode)}&difficulty=${matchRequestData.difficulty}&language=${matchRequestData.programmingLanguage}`)


    setMatchRequestData(false);
  };

  // Handler for rejecting a match request
  const handleReject = () => {
    if (socket && matchRequestData) {
      socket.emit('requestRejected', matchRequestData);
    }
    setMatchRequestData(false);
  };

  return (
    <div className='Home'>
      <Header onNavToggle={toggleNav} />
      <div className='homeContent'>
        <Nav
          currPage="home"
          matchRequestData={matchRequestData}
          rejectCountdown={rejectCountdown}
          onAccept={handleAccept}
          onReject={handleReject}
          isOpen={isNavOpen}
          onClose={closeNav}
        />

        <div className='modesContainer'>
          <Mode
            modeName='QUICK DEBUG MODE'
            modeValue='quick-debug'
            modeImg={coder}
            modeImg2={coder2}
            modeDescription='Resolve all errors in the provided code faster than your opponent within the allocated time.'
            onQuickMatch={handleQuickMatchClick}
          />
          <Mode
            modeName='STANDARD DUEL'
            modeValue='standard-duel'
            modeImg={coder}
            modeImg2={coder2}
            modeDescription='A real-time 1v1 coding battle where the first player to submit a fully correct solution wins the match.'
            onQuickMatch={handleQuickMatchClick}
          />
        </div>
        <div className='homeLeaderBoardContainer'>
          <HomeLeaderBoard />
        </div>
        <div className='homeHistoryContainer'>
          <HomeHistory />
        </div>
      </div>
      <MatchSetupPopup
        show={showMatchSetup}
        onClose={handleCloseMatchSetup}
        onSubmit={handleMatchSetupSubmit}
        matchSettings={matchSettings}
        onChange={handleMatchSettingsChange}
        disableModeSelect={true}
      />
    </div>
  );
};

export default Home;
