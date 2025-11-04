import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode'; // adjust the import if necessary
import "../styles/MatchWait.css";
import { useSocket } from '../SocketContext';

const useQuery = () => new URLSearchParams(useLocation().search);

export const MatchWait = () => {
  const token = localStorage.getItem('token');
  const query = useQuery();
  const requesterId = query.get("requesterId");
  const receiverId = query.get("receiverId");
  const difficulty = query.get("difficulty");
  const programmingLanguage = query.get("language");
  const mode = query.get("mode");

  const [matchId, setMatchId] = useState(null);
  const matchInitiated = useRef(false);

  const [matchCreating, setMatchCreating] = useState(true);
  const [counter, setCounter] = useState(10);
  const navigate = useNavigate();
  const socket = useSocket();

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
    if (socket) {
      // Build the query string with requesterId and receiverId
      const queryParams = new URLSearchParams({ requesterId, receiverId }).toString();
      const url = `${process.env.REACT_APP_BACKEND_URL}/auth/user?${queryParams}`;

      fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then((data) => {
          const playersDocs = data;

          // Only emit beginMatch if the current user is the requester and it hasn't been initiated yet.
          if (currentUserId === requesterId && requesterId && receiverId && !matchInitiated.current) {
            matchInitiated.current = true; // Prevent re-emitting on re-renders
            // The requester is responsible for fetching the question.
            const lang = programmingLanguage === "js" ? "javascript" : programmingLanguage === "py" ? "python" : programmingLanguage;
            const filterStr = `mode_slug=${mode}&question_difficulty=${difficulty}&programming_language=${lang}`;
            
            fetch(`${process.env.REACT_APP_BACKEND_URL}/questions?${filterStr}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch question');
                return res.json();
            })
            .then(questionData => {
                if (questionData.data && questionData.data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * questionData.data.length);
                    const questionId = questionData.data[randomIndex]._id;

                    // Emit beginMatch with the questionId
                    socket.emit('beginMatch', {
                      requesterId,
                      receiverId,
                      difficulty,
                      mode,
                      programmingLanguage,
                      questionId,
                    });
                } else {
                    throw new Error('No questions found for the selected criteria.');
                }
            })
            .catch(error => {
                console.error('Error setting up match:', error);
                // alert('Failed to set up the match. Please try again.');
                // navigate('/', { replace: true });
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });

      const handleBeginMatch = (data) => {
        if (data.match && data.match._id) {
          setMatchId(data.match._id);
          setMatchCreating(false);
        } else {
          setMatchId(data.createdMatch._id);
          setMatchCreating(false);
        }
      };

      // Prevent duplicate listeners
      socket.off('beginMatch', handleBeginMatch);
      socket.on('beginMatch', handleBeginMatch);

      return () => {
        socket.off('beginMatch', handleBeginMatch); // Cleanup listener on unmount
      };
    }
  }, [socket, token, currentUserId, requesterId, receiverId, difficulty, mode, programmingLanguage]);

  // Countdown timer effect: once matchCreating becomes false, start the countdown.
  useEffect(() => {
    if (!matchCreating) {
      const timer = setInterval(() => {
        setCounter((prevCounter) => {
          if (prevCounter <= 1) {
            clearInterval(timer);
            navigate(`/match?matchId=${matchId}`, { replace: true }); // Navigate when countdown reaches 0
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
