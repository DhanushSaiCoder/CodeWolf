import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode'; // adjust the import if necessary
import "../styles/MatchWait.css";

const useQuery = () => new URLSearchParams(useLocation().search);

export const MatchWait = () => {
  const token = localStorage.getItem('token');
  const query = useQuery();
  const requesterId = query.get("requesterId");
  const receiverId = query.get("receiverId");
  const difficulty = query.get("difficulty");
  const programmingLanguage = query.get("language");
  const mode = query.get("mode");

  const [matchCreating, setMatchCreating] = useState(true);
  const [counter, setCounter] = useState(10);
  const navigate = useNavigate();

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
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then((data) => {
          console.log('Fetched user data:', data);
          const playersDocs = data;

          // Only emit beginMatch if:
          // 1. The current user is the requester,
          // 2. requesterId and receiverId are provided,
          // 3. And no match has been initiated already.
          if (currentUserId === requesterId && requesterId && receiverId) {
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
      console.log('beginMatch event received', data);
      setMatchCreating(false);
    };

    // Prevent duplicate listeners
    newSocket.off('beginMatch', handleBeginMatch);
    newSocket.on('beginMatch', handleBeginMatch);

    return () => {
      newSocket.off('beginMatch', handleBeginMatch); // Cleanup listener on unmount
      // Optionally disconnect socket here if needed:
      // newSocket.disconnect();
    };
  }, [token, currentUserId, requesterId, receiverId]);

  // Countdown timer effect: once matchCreating becomes false, start the countdown.
  useEffect(() => {
    if (!matchCreating) {
      const timer = setInterval(() => {
        setCounter((prevCounter) => {
          if (prevCounter <= 1) {
            clearInterval(timer);
            navigate('/match', { replace: true }); // Navigate when countdown reaches 0
            return 0;
          }
          return prevCounter - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [matchCreating, navigate]);

  // New effect: After 10 seconds from mounting, if the match is still being created,
  // alert the user and navigate back to "/"
  useEffect(() => {
    if (matchCreating) {
      const timeout = setTimeout(() => {
        // Only trigger if matchCreating is still true after 10 seconds
        if (matchCreating) {
          alert("Match creation timed out. Redirecting to home.");
          navigate('/', { replace: true });
        }
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [matchCreating, navigate]);

  // Determine the display text based on the counter value
  const getDisplayText = () => {
    if (counter === 3) return "GET";
    if (counter === 2) return "SET";
    if (counter === 1) return "GO!";
    return counter;
  };

  // Append additional CSS class based on counter value for custom colors
  const getCounterClassName = () => {
    const baseClass = 'MWcounterTxt fade';
    if (counter === 3) return `${baseClass} getText`;
    if (counter === 2) return `${baseClass} setText`;
    if (counter === 1) return `${baseClass} goText`;
    return baseClass;
  };

  return (
    <div className='MatchWait'>
      {matchCreating && (
        <div className="MWspinner-container">
          <div>Creating Match</div>
          <div className="MWspinner"></div>

        </div>
      )}
      {!matchCreating && (
        <div className='counterDiv'>
          <p>Match starts in</p>
          <h3 key={counter} className={getCounterClassName()}>
            {getDisplayText()}
          </h3>
        </div>
      )}
    </div>
  );
};

export default MatchWait;
