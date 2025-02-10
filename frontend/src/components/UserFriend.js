import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode'; // Use default import for jwt-decode

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
    const [matchRequestData, setMatchRequestData] = useState(false)

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
            setMatchRequestData(data)
        });

        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, [token]);

    // Update the form state when the user changes inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setMatchSettings(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // This handler is used when a user clicks the quick match button
    // It sets the selected friend and opens the match settings popup.
    const configureMatch = (user) => {
        setSelectedFriend(user);
        showPopup(true);
    };

    // Instead of setting state and then immediately calling requestMatch (risking stale state),
    // merge the match settings with the selected friend info in a local variable and send.
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedFriend) {
            console.error('No friend selected!');
            return;
        }

        const newMatchDetails = {
            userId: selectedFriend.id, // the friend’s id to challenge
            ...matchSettings,          // the settings from the form
        };

        const requestMatchPayload = {
            ...newMatchDetails,
            message: 'You have a match request!',
            requesterId: jwtDecode(token)._id,
            requesterUsername: userDoc.username,
            requesterRating: userDoc.rating,
        }
        console.log('Sending match request with details:', requestMatchPayload);

        // Emit the socket event with all necessary details.
        socket.emit('requestMatch', requestMatchPayload);

        // Optionally clear the selected friend and close the popup.
        setSelectedFriend(null);
        showPopup(false);
    };

    // For a “direct” quick match (without configuring settings) you might have a function like:
    const sendQuickMatch = (user) => {
        const quickMatchDetails = {
            userId: user.id,
            // Here you can use the default settings or any predetermined ones.
            programmingLanguage: 'js',
            difficulty: 'easy',
            mode: 'quick-debug',
        };

        socket.emit('requestMatch', {
            ...quickMatchDetails,
            message: 'You have a match request!',
            requesterId: jwtDecode(token)._id,
            requesterUsername: userDoc.username,
            requesterRating: userDoc.rating,
        });
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
                        // Here we decide whether to show the friend depending on the onlineOnly prop.
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
                                {/* Choose one of the two buttons below:
                    1. If you want the user to configure the match settings in a popup,
                       use the "configureMatch" button.
                    2. If you want to send a quick match immediately (with default settings),
                       use the "sendQuickMatch" button.
                 */}
                                <button
                                    className='modeBtns quickMatchBtn UserFriendQuickMatchBtn'
                                    disabled={userFriend.status !== "online"}
                                    onClick={() => configureMatch(userFriend)}
                                >
                                    <b>QUICK MATCH</b>
                                </button>

                                {/* Example of a direct quick match (uncomment to use) */}
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

            {/* (Optional) Example section showing an incoming match request */}
            {matchRequestData && (
                <div className='requestDiv'>
                    <h1 className='RHeading'>MATCH INVITE</h1>
                    <h2>
                       {matchRequestData.requesterUsername}<span className='RRating'>({matchRequestData.requesterRating})</span>
                    </h2>
                    <p>
                        <i>invited you for a match</i>
                    </p>
                    <div className='RModeDetailsDiv'>
                        <p className='RModeDetails'>
                            <b>MODE:</b> {matchRequestData.mode} - {matchRequestData.programmingLanguage}
                        </p>
                        <p className='RModeDetails'>
                            <b>DIFFICULTY:</b> {matchRequestData.difficulty}
                        </p>
                    </div>
                    <div className='acceptRejectDiv'>
                        <button className='RAccept'>Accept</button>
                        <button className='RReject'>Reject</button>
                    </div>
                </div>
            )}
        </div>
    );
};
