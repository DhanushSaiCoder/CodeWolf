// UserFriend.js
import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Ensure proper import of jwt-decode
import "../styles/UserFriend.css";
import { MatchRequest } from './MatchRequest';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../SocketContext';
import profileImg from '../images/profile.jpg';
import { toLowQualityPic } from '../images/toLowQualityPic';
import ImageWithLoader from './ImageWithLoader';
import MatchSetupPopup from './MatchSetupPopup';

export const UserFriend = (props) => {
  const navigate = useNavigate()
  const { userDoc, userFriendsData, UFloading: loading, setUFLoading: setLoading, fetchUserFriend } = props;
  const socket = useSocket();
  const [popup, showPopup] = useState(false);
  const token = localStorage.getItem('token');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    if (socket) {
      socket.on('sendMatchRequest', (data) => {
        setMatchRequestData(data);

        // Automatically reject the match request after 10 seconds if no action is taken
        setTimeout(() => {
          if (data && socket) {
            socket.emit('requestRejected', data);
          }
          setMatchRequestData(false);
        }, 10000);
      });

      // Listen for rejection notifications from opponents (i.e. when your match request is rejected)
      socket.on('requestRejected', (data) => {
        // Ensure that the current user is the original requester
        const currentUserId = jwtDecode(token)._id;
        if (data.requesterId === currentUserId) {
          // Mark the corresponding opponent (data.userId) as rejected
          setRejectedOpponents(prev => ({ ...prev, [data.userId]: true }));
        }
      });

      // Listen for rejection notifications from opponents (i.e. when your match request is rejected)
      socket.on('requestAccepted', (data) => {
        // Ensure that the current user is the original requester
        const currentUserId = jwtDecode(token)._id;
        if (data.requesterId === currentUserId) {
          // Mark the corresponding opponent (data.userId) as rejected
          navigate(`/matchwait/?requesterId=${data.requesterId}&receiverId=${data.receiverId}&mode=${encodeURI(data.mode)}&difficulty=${data.difficulty}&language=${data.programmingLanguage}`)

        }
      });

      return () => {
        socket.off('sendMatchRequest');
        socket.off('requestRejected');
        socket.off('requestAccepted');
      };
    }
  }, [socket, token, navigate]);

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
      delete newObj[user._id];
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

    const { programmingLanguage, difficulty, mode } = matchSettings;
    const requesterId = jwtDecode(token)._id;
    const receiverId = selectedFriend._id;

    if (selectedFriend.status === 'offline') {
      const inviteLink = `http://localhost:3000/waInviteWait?requesterId=${requesterId}&receiverId=${receiverId}&difficulty=${difficulty}&language=${programmingLanguage}&mode=${mode}`;
      const message = `Let's have a CodeWolf match! Join me here: ${inviteLink}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      navigate(`/waInviteWait?requesterId=${requesterId}&receiverId=${receiverId}&difficulty=${difficulty}&language=${programmingLanguage}&mode=${mode}`);

      setSelectedFriend(null);
      showPopup(false);
      return;
    }

    const newMatchDetails = {
      userId: selectedFriend._id,
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
    setSentRequests(prev => ({ ...prev, [selectedFriend._id]: true }));
    // Reset the button text after 10 seconds
    setTimeout(() => {
      setSentRequests(prev => {
        const newState = { ...prev };
        delete newState[selectedFriend._id];
        return newState;
      });
    }, 10000);

    setSelectedFriend(null);
    showPopup(false);
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
      <MatchSetupPopup
        show={popup}
        onClose={() => showPopup(false)}
        onSubmit={handleSubmit}
        matchSettings={matchSettings}
        onChange={handleChange}
      />

      <div className="data">
        <div className="friends-header">
          <h4>FRIENDS</h4>
          <button
            className={`refresh-button ${isRefreshing ? 'clicked' : ''}`}
            onClick={() => {
              setIsRefreshing(true);
              fetchUserFriend();
              setTimeout(() => setIsRefreshing(false), 500); // Match CSS transition duration
            }}
          >
            &#x21BB; {/* Unicode refresh icon */}
          </button>
        </div>
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
                key={userFriend._id}
              >
                <p>{index + 1}</p>

                <div className="UserFriend__userDetails">
                  <div className='UF_profile_and_username_and_rating'>
                    <ImageWithLoader className='UF_profilePic' src={userFriend.profilePic ? toLowQualityPic(userFriend.profilePic) : profileImg} alt={userFriend.username} />
                    <div className='UF_profile_and_rating'>
                      <h3 className="UserFriend__username">{userFriend.username}</h3>
                      <p>
                        <span className="userFriend__rating">&#8902; </span>
                        {userFriend.rating}
                      </p>
                    </div>
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
                  {userFriend.status == "offline" ? (
                    <button
                      className="offPlWaInviteBtn"
                      onClick={() => configureMatch(userFriend)}
                    >
                      <b>
                        INVITE
                      </b>
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
                          <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path><path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path><path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path><path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path><path fill="#fff" fill-rule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                  ) : (
                    <button
                      className="UFModeBtns quickMatchBtn UserFriendQuickMatchBtn"
                      disabled={userFriend.status !== "online" || sentRequests[userFriend._id]}
                      onClick={() => configureMatch(userFriend)}
                    >
                      <b>{sentRequests[userFriend._id] ? "REQUEST SENT" : "QUICK MATCH"}</b>
                    </button>

                  )}
                  {/* Display "Rejected" below the QUICK MATCH button if this friend rejected your request */}
                  {rejectedOpponents[userFriend._id] && (
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
    </div >
  );
};