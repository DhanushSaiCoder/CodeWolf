import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { CSSTransition } from 'react-transition-group';

import "../styles/UserFriend.css";
import { NotUserFriend } from './NotUserFriend';

export const UserFriend = (props) => {
  const {
    userDoc,
    userFriendsData,
    UFloading: loading,
    setUFLoading: setLoading,
  } = props;
  const [socket, setSocket] = useState(null);
  const [popup, showPopup] = useState(false);
  const token = localStorage.getItem('token');

  // Holds the ID of the user you want to challenge (set when clicking a friend)
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Hold the form values
  const [matchSettings, setMatchSettings] = useState({
    programmingLanguage: 'js', // Default: JavaScript
    difficulty: 'easy',        // Default: Easy
    mode: 'quick-debug'
  });
  const [matchRequestData, setMatchRequestData] = useState(false);

  // New state to hold the countdown for auto-rejection (in seconds)
  const [rejectCountdown, setRejectCountdown] = useState(10);

  // Create a ref for the requestDiv to avoid using findDOMNode
  const requestDivRef = useRef(null);

  useEffect(() => {
    // Establish the socket connection
    const newSocket = io('http://localhost:5000', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to the server');
      newSocket.emit('sendToken', token);
    });

    newSocket.on('sendMatchRequest', (data) => {
      console.log('Received customEvent in the client:', data);
      setMatchRequestData(data);

      // Automatically clear the match request after 10 seconds
      setTimeout(() => {
        setMatchRequestData(false);
      }, 10000);
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // Start (or reset) the countdown whenever a new match request is received
  useEffect(() => {
    if (matchRequestData) {
      setRejectCountdown(10); // Reset countdown to 10 seconds
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

  // Update the form state when the user changes inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMatchSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const configureMatch = (user) => {
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
      userId: selectedFriend.id, // the friend’s id to challenge
      ...matchSettings,
    };

    const requestMatchPayload = {
      ...newMatchDetails,
      message: 'You have a match request!',
      requesterId: jwtDecode(token)._id,
      requesterUsername: userDoc.username,
      requesterRating: userDoc.rating,
    };
    console.log('Sending match request with details:', requestMatchPayload);

    if (socket) {
      socket.emit('requestMatch', requestMatchPayload);
    }

    setSelectedFriend(null);
    showPopup(false);
  };

  const sendQuickMatch = (user) => {
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
  };

  return (
    <div className='UserFriend'>
      {popup && (
        <div onClick={() => showPopup(false)} className='RPopupDivContainer'>
          <div onClick={(e) => e.stopPropagation()} className='RPopupDiv'>
            <div className='popupHeader'>
              Set Match
              <button
                type="button"
                onClick={() => showPopup(false)}
                className='closeButton'
              >
                &times;
              </button>
            </div>
            <div className='popupContent'>
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
                    <option value="c">C</option>
                    <option value="java">Java</option>
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

      <div className='data'>
        <h4>FRIENDS</h4>
        {loading ? <p>Loading...</p> : (
          userFriendsData.length ? userFriendsData.map((userFriend, index) => {
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
                <div className='UserFriend__userDetails'>
                  <div>
                    <h3 className='UserFriend__username'>{userFriend.username}</h3>
                    <p>
                      <span className='userFriend__rating'>&#8902; </span>
                      {userFriend.rating}
                    </p>
                  </div>
                </div>
                {userFriend.status === "online" ? (
                  <div className='UserFriend__onlineBadgeDiv'>
                    <div className='UserFriend__onlineBadge'></div>
                    <p>Online</p>
                  </div>
                ) : (
                  <div className='UserFriend__offlineBadgeDiv'>
                    <div className='UserFriend__offlineBadge'></div>
                    <p>Offline</p>
                  </div>
                )}
                <button
                  className='modeBtns quickMatchBtn UserFriendQuickMatchBtn'
                  disabled={userFriend.status !== "online"}
                  onClick={() => configureMatch(userFriend)}
                >
                  <b>QUICK MATCH</b>
                </button>
                {/*
                <button
                  className='modeBtns quickMatchBtn UserFriendQuickMatchBtn'
                  disabled={userFriend.status !== "online"}
                  onClick={() => sendQuickMatch(userFriend)}
                >
                  <b>QUICK MATCH</b>
                </button>
                */}
              </div>
            );
          }) : <p>No Friends</p>
        )}
      </div>

      {/* Wrap the match request div with CSSTransition using nodeRef */}
      <CSSTransition
        in={!!matchRequestData}
        timeout={300}
        classNames="slide"
        unmountOnExit
        nodeRef={requestDivRef}
      >
        <div ref={requestDivRef} className='requestDiv'>
          <h1 className='RHeading'>MATCH INVITE</h1>
          <h2>
            {matchRequestData && matchRequestData.requesterUsername}
            <span className='RRating'>
              ({matchRequestData && matchRequestData.requesterRating})
            </span>
          </h2>
          <p>
            <i>invited you for a match</i>
          </p>
          <div className='RModeDetailsDiv'>
            <p className='RModeDetails'>
              <b>MODE:</b> {matchRequestData && matchRequestData.mode} - {matchRequestData && matchRequestData.programmingLanguage}
            </p>
            <p className='RModeDetails'>
              <b>DIFFICULTY:</b> {matchRequestData && matchRequestData.difficulty}
            </p>
          </div>
          <div className='acceptRejectDiv'>
            <button className='RAccept'>Accept</button>
            {/* The reject button now shows the countdown next to it */}
            <button 
              className='RReject' 
              onClick={() => setMatchRequestData(false)}
            >
              Reject ({rejectCountdown})
            </button>
          </div>
        </div>
      </CSSTransition>
    </div>
  );
};
