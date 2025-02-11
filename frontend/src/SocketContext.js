// frontend/src/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Retrieve token from localStorage
    const token = localStorage.getItem('token');
    
    // Create a new socket instance and pass the token in the auth options
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });
    setSocket(newSocket);

    // Clean up the socket when the component unmounts
    return () => newSocket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
