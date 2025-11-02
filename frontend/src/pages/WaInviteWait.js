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

  const [waiting, setWaiting] = useState(true);

  let currentUserId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      currentUserId = decoded._id;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  useEffect(() => {
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
  }, [socket, currentUserId, requesterId, receiverId, difficulty, programmingLanguage, mode, navigate]);

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
