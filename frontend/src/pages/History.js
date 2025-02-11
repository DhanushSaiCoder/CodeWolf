// History.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/History.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { useSocket } from '../SocketContext';
import { jwtDecode } from 'jwt-decode';

const History = () => {
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

    // Optionally decode the token if needed
    const decodedToken = jwtDecode(token);
    // (You can use decodedToken here if needed)

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

  // Handler for accepting a match request
  const handleAccept = () => {
    console.log('Match accepted!');
    // Add any additional accept logic here (e.g., navigate to match page)
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
        <Nav
          currPage="history"
          matchRequestData={matchRequestData}
          rejectCountdown={rejectCountdown}
          onAccept={handleAccept}
          onReject={handleReject}
        />
        {/* Add History-specific content below */}
        <div className="historyContent">
          {/* Your History page content goes here */}
        </div>
      </div>
    </div>
  );
};

export default History;
