import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import "../styles/WaInviteWait.css";
import { useSocket } from '../SocketContext';

const useQuery = () => new URLSearchParams(useLocation().search);

export const WaInviteWait = () => {
  const token = localStorage.getItem('token');
  const query = useQuery();
  const navigate = useNavigate();
  const socket = useSocket();

  const requesterId = query.get("requesterId");
  const receiverId = query.get("receiverId");
  const difficulty = query.get("difficulty");
  const programmingLanguage = query.get("language");
  const mode = query.get("mode");

  const location = useLocation();
  const [waiting, setWaiting] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      // Not logged in, redirect to login
      navigate(`/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    const currentUserId = jwtDecode(token)._id;

    if (currentUserId !== requesterId && currentUserId !== receiverId) {
      setErrorMessage("You are not authorized to join this match. This invitation was intended for a different user.");
      setWaiting(false);
      return;
    }

    if (socket && currentUserId) {
      // Both users listen for the match to be ready
      const handleMatchReady = (data) => {
        setWaiting(false);
        navigate(`/matchwait/?requesterId=${data.requesterId}&receiverId=${data.receiverId}&mode=${encodeURI(data.mode)}&difficulty=${data.difficulty}&language=${data.programmingLanguage}`, { replace: true });
      };
      socket.on('waMatchReady', handleMatchReady);

      // If the current user is the receiver, they should announce they've joined.
      if (currentUserId === receiverId) {
        const joinDetails = {
          requesterId,
          receiverId,
          difficulty,
          programmingLanguage,
          mode,
        };
        socket.emit('inviteeJoined', joinDetails);
      }

      return () => {
        socket.off('waMatchReady', handleMatchReady);
      };
    }
  }, [token, socket, location, navigate, requesterId, receiverId, difficulty, programmingLanguage, mode]);

  if (!token) {
    // Render nothing while redirecting
    return null;
  }


  if (errorMessage) {
    return (
      <div className='WaInviteWait'>
        <div className="error-container">
          <p>{errorMessage}</p>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className='WaInviteWait'>
      {waiting && (
        <div className="WIWspinner-container">
          <div>Waiting for opponent to join...</div>
          <div className="WIWspinner"></div>
        </div>
      )}
      {!waiting && (
        <div>
          <p>Opponent has joined! Redirecting to match...</p>
        </div>
      )}
    </div>
  );
};

export default WaInviteWait;
