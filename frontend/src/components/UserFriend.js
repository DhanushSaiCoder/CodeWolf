// UserFriend.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode'; // Ensure proper import of jwt-decode
import "../styles/UserFriend.css";
import { NotUserFriend } from './NotUserFriend';
import { MatchRequest } from './MatchRequest';
import { useNavigate } from 'react-router-dom';

export const UserFriend = (props) => {
  const navigate = useNavigate()
  const { userDoc, userFriendsData, UFloading: loading, setUFLoading: setLoading } = props;
  const [socket, setSocket] = useState(null);
  const [popup, showPopup] = useState(false);
  const token = localStorage.getItem('token');

  // Holds the friend you want to challenge (set when clicking a friend)
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Hold the form values for match settings
  const [matchSettings, setMatchSettings] = useState({
    programmingLanguage: 'js', // Default: JavaScript
    difficulty: 'easy',        // Default: Easy
    mode: 'quick-debug'
  });
  const [matchRequestData, setMatchRequestData] = useState(false);

  // State for auto‑reject countdown (in seconds)
  const [rejectCountdown, setRejectCountdown] = useState(10);

  // State to track which opponents have rejected your request (by their ID)
  const [rejectedOpponents, setRejectedOpponents] = useState({});

  // State to track which opponents have been sent a request
  const [sentRequests, setSentRequests] = useState({});

  useEffect(() => {
    // Establish the socket connection
    const newSocket = io('http://localhost:5000', { auth: { token } });

    newSocket.on('connect', () => {
      newSocket.emit('sendToken', token);
    });

    newSocket.on('sendMatchRequest', (data) => {
      setMatchRequestData(data);

      // Automatically reject the match request after 10 seconds if no action is taken
      setTimeout(() => {
        if (data && newSocket) {
          newSocket.emit('requestRejected', data);
        }
        setMatchRequestData(false);
      }, 10000);
    });

    // Listen for rejection notifications from opponents (i.e. when your match request is rejected)
    newSocket.on('requestRejected', (data) => {
      // Ensure that the current user is the original requester
      const currentUserId = jwtDecode(token)._id;
      if (data.requesterId === currentUserId) {
        // Mark the corresponding opponent (data.userId) as rejected
        setRejectedOpponents(prev => ({ ...prev, [data.userId]: true }));
      }
    });

    // Listen for rejection notifications from opponents (i.e. when your match request is rejected)
    newSocket.on('requestAccepted', (data) => {
      // Ensure that the current user is the original requester
      const currentUserId = jwtDecode(token)._id;
      if (data.requesterId === currentUserId) {
        // Mark the corresponding opponent (data.userId) as rejected
        navigate(`/matchwait/?requesterId=${data.requesterId}&receiverId=${data.receiverId}&mode=${encodeURI(data.mode)}&difficulty=${data.difficulty}&language=${data.programmingLanguage}`)

      }
    });
    setSocket(newSocket);

  }, [token]);

  // Start (or reset) the countdown whenever a new match request is displayed
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

  // Update form state when user changes inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMatchSettings(prev => ({ ...prev, [name]: value }));
  };

  // When configuring a match for an opponent, clear any previous rejection for that opponent
  const configureMatch = (user) => {
    setRejectedOpponents(prev => {
      const newObj = { ...prev };
      delete newObj[user.id];
      return newObj;
    });
    setSelectedFriend(user);
    showPopup(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFriend) {
      console.error('No friend selected!');
      return;
    }
    const newMatchDetails = {
      userId: selectedFriend.id,
      ...matchSettings,
    };
    const requestMatchPayload = {
      ...newMatchDetails,
      message: 'You have a match request!',
      requesterId: jwtDecode(token)._id,
      requesterUsername: userDoc.username,
      requesterRating: userDoc.rating,
    };
    if (socket) {
      socket.emit('requestMatch', requestMatchPayload);
    }

    // Mark that a request has been sent to this friend
    setSentRequests(prev => ({ ...prev, [selectedFriend.id]: true }));
    // Reset the button text after 10 seconds
    setTimeout(() => {
      setSentRequests(prev => {
        const newState = { ...prev };
        delete newState[selectedFriend.id];
        return newState;
      });
    }, 10000);

    setSelectedFriend(null);
    showPopup(false);
  };

  // (Optional) For a quick match method without a popup
  const sendQuickMatch = (user) => {
    // Clear previous rejection for this opponent when sending a new match request
    setRejectedOpponents(prev => {
      const newObj = { ...prev };
      delete newObj[user.id];
      return newObj;
    });
    // Mark that a request is sent
    setSentRequests(prev => ({ ...prev, [user.id]: true }));
    const quickMatchDetails = {
      userId: user.id,
      programmingLanguage: 'js',
      difficulty: 'easy',
      mode: 'quick-debug',
    };
    if (socket) {
      socket.emit('requestMatch', {
        ...quickMatchDetails,
        message: 'You have a match request!',
        requesterId: jwtDecode(token)._id,
        requesterUsername: userDoc.username,
        requesterRating: userDoc.rating,
      });
    }
    // Reset the button text after 10 seconds
    setTimeout(() => {
      setSentRequests(prev => {
        const newState = { ...prev };
        delete newState[user.id];
        return newState;
      });
    }, 10000);
  };

  // Handler functions for the match request component
  const handleAccept = () => {
    // Add your accept logic here (e.g., notify the server, redirect to match page, etc.)

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
    <div className="UserFriend">
      {popup && (
        <div onClick={() => showPopup(false)} className="RPopupDivContainer">
          <div onClick={(e) => e.stopPropagation()} className="RPopupDiv">
            <div className="popupHeader">
              Set Match
              <button type="button" onClick={() => showPopup(false)} className="closeButton">
                &times;
              </button>
            </div>
            <div className="popupContent">
              <form onSubmit={handleSubmit}>
                <div className="formGroup">
                  <label htmlFor="programmingLanguage">Programming Language:</label>
                  <select
                    id="programmingLanguage"
                    name="programmingLanguage"
                    value={matchSettings.programmingLanguage}
                    onChange={handleChange}
                    required
                  >
                    <option value="js">JavaScript</option>
                    <option value="py">Python</option>
                  </select>
                </div>
                <div className="formGroup">
                  <label htmlFor="difficulty">Difficulty:</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={matchSettings.difficulty}
                    onChange={handleChange}
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="formGroup">
                  <label htmlFor="mode">Mode:</label>
                  <select
                    id="mode"
                    name="mode"
                    value={matchSettings.mode}
                    onChange={handleChange}
                    required
                  >
                    <option value="quick-debug">QUICK DEBUG MODE</option>
                  </select>
                </div>
                <button type="submit">SEND MATCH REQUEST</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="data">
        <h4>FRIENDS</h4>
        {loading ? (
          <p>Loading...</p>
        ) : userFriendsData.length ? (
          userFriendsData.map((userFriend, index) => {
            if (props.onlineOnly && userFriend.status !== "online") {
              return null;
            }
            return (
              <div
                className={
                  userFriend.status === "online"
                    ? "UserFriend__container onlineUF"
                    : "UserFriend__container offlineUF"
                }
                key={userFriend.id}
              >
                <p>{index + 1}</p>
                <div className="UserFriend__userDetails">
                  <div>
                    <h3 className="UserFriend__username">{userFriend.username}</h3>
                    <p>
                      <span className="userFriend__rating">&#8902; </span>
                      {userFriend.rating}
                    </p>
                  </div>
                </div>
                {userFriend.status === "online" ? (
                  <div className="UserFriend__onlineBadgeDiv">
                    <div className="UserFriend__onlineBadge"></div>
                    <p>Online</p>
                  </div>
                ) : (
                  <div className="UserFriend__offlineBadgeDiv">
                    <div className="UserFriend__offlineBadge"></div>
                    <p>Offline</p>
                  </div>
                )}
                <div className='buttons_rejectedTxtDiv'>

                  <button
                    className="UFModeBtns quickMatchBtn UserFriendQuickMatchBtn"
                    disabled={userFriend.status !== "online" || sentRequests[userFriend.id]}
                    onClick={() => configureMatch(userFriend)}
                  >
                    <b>{sentRequests[userFriend.id] ? "REQUEST SENT" : "QUICK MATCH"}</b>
                  </button>
                  {/* Display "Rejected" below the QUICK MATCH button if this friend rejected your request */}
                  {rejectedOpponents[userFriend.id] && (
                    <p className="rejectedLabel">Rejected</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>No Friends</p>
        )}
      </div>

      {/* Use the extracted MatchRequest component */}
      <MatchRequest
        matchRequestData={matchRequestData}
        rejectCountdown={rejectCountdown}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </div>
  );
};
