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
    const receiverId = query.get("receiverId");
    const difficulty = query.get("difficulty");
    const programmingLanguage = query.get("language");
    const mode = query.get("mode");

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

            // Build the query string with requesterId and receiverId
            const queryParams = new URLSearchParams({ requesterId, receiverId }).toString();
            const url = `http://localhost:5000/auth/user?${queryParams}`;

            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Fetched user data:', data);
                    const playersDocs = data;

                    // Only emit beginMatch if:
                    // 1. The current user is the requester,
                    // 2. requesterId and receiverId are provided,
                    // 3. And no match has been initiated already.
                    if (
                        currentUserId === requesterId &&
                        requesterId &&
                        receiverId
                    ) {
                        console.log('Emitting beginMatch with playersDocs:', playersDocs);
                        newSocket.emit('beginMatch', {
                            requesterId,
                            receiverId,
                            playersDocs,
                            difficulty,
                            mode,
                            programmingLanguage,
                        });
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error);
                });
        });

        const handleBeginMatch = (data) => {
            alert('Match begins..');
            console.log('beginMatch event received', data);
        };

        // Prevent duplicate listeners
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
            <p>Match Mode: {mode}</p>
            <p>Match Language: {programmingLanguage}</p>
            <p>Match Difficulty: {difficulty}</p>
        </div>
    );
};

export default MatchWait;
