// Settings.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { useSocket } from '../SocketContext';
import { jwtDecode } from 'jwt-decode';

const Settings = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [matchRequestData, setMatchRequestData] = useState(null);
  const [rejectCountdown, setRejectCountdown] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    // (Optional) Decode the token if needed
    const decodedToken = jwtDecode(token);
    // You can use decodedToken here if necessary

    if (socket) {
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

      socket.on('sendMatchRequest', handleMatchRequest);

      return () => {
        socket.off('sendMatchRequest', handleMatchRequest);
      };
    }
  }, [navigate, socket]);

  // Manage the auto‑reject countdown for match requests
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

  const handleAccept = () => {
    // Add your accept logic here (e.g., notify the server, redirect to match page, etc.)
    console.log("Match accepted", matchRequestData);

    socket.emit('requestAccepted', matchRequestData);
    navigate(`/matchwait/?requesterId=${matchRequestData.requesterId}&receiverId=${matchRequestData.userId}&mode=${encodeURI(matchRequestData.mode)}&difficulty=${matchRequestData.difficulty}&language=${matchRequestData.programmingLanguage}`)


    setMatchRequestData(false);
  };

  const handleReject = () => {
    if (socket && matchRequestData) {
      socket.emit('requestRejected', matchRequestData);
    }
    setMatchRequestData(false);
  };

  return (
    <div className='Settings'>
      <Header />
      <div className='SettingsContainer'>
        <div className='settingsNavDiv'>
          <Nav
            currPage="settings"
            matchRequestData={matchRequestData}
            rejectCountdown={rejectCountdown}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>
        <div className='settingsContent'>
          <p>this is settings, section</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
