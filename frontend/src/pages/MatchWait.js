import React, { useEffect } from 'react';
import { useLocation } from "react-router-dom";
import io from 'socket.io-client';
import {jwtDecode} from 'jwt-decode';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export const MatchWait = (props) => {
  const token = localStorage.getItem('token');
  const query = useQuery();
  const requesterId = query.get("requesterId");
  const receiverId = query.get("receiverId");  // Corrected spelling

  // Decode the token to get the current user's ID
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
    const newSocket = io('http://localhost:5000', { auth: { token } });

    newSocket.on('connect', () => {
      console.log('Connected to the server');
      newSocket.emit('sendToken', token);

      // Emit beginMatch only if the current user is the requester
      if (currentUserId === requesterId && requesterId && receiverId) {
        newSocket.emit('beginMatch', { requesterId, receiverId });
      }
    });

    const handleBeginMatch = () => {
      alert('Match begins..');
      console.log('beginMatch event received');
    };

    // Ensure no duplicate listeners exist
    newSocket.off('beginMatch', handleBeginMatch);
    newSocket.on('beginMatch', handleBeginMatch);

    return () => {
      newSocket.off('beginMatch', handleBeginMatch); // Cleanup listener on unmount
      newSocket.disconnect();
    };
  }, [token, currentUserId, requesterId, receiverId]);

  return (
    <div>
      <p>Requester ID: {requesterId}</p>
      <p>Receiver ID: {receiverId}</p>
    </div>
  );
}

export default MatchWait;
