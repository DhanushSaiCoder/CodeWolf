import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

import "../styles/UserFriend.css";
import { NotUserFriend } from './NotUserFriend';

export const UserFriend = (props) => {
    const {
        userDoc,
        userFriendsData,
        UFloading: loading,
        setUFLoading: setLoading,
    } = props;
    const [requestData, setRequestData] = useState({});
    const [socket, setSocket] = useState(null);
    const [popup, showPopup] = useState(false);
    const token = localStorage.getItem('token'); // Get the JWT token from local storage

    // State to hold the form inputs with default values
    const [matchSettings, setMatchSettings] = useState({
        programmingLanguage: 'js', // Default: JavaScript
        difficulty: 'easy',        // Default: Easy
        mode: 'quick-debug'
    });

    useEffect(() => {
        // Establish the socket connection
        const newSocket = io('http://localhost:5000', {
            auth: { token },
        });

        newSocket.on('connect', () => {
            console.log('Connected to the server');
            // Emit the token so that the server can verify it and join the room
            newSocket.emit('sendToken', token);
        });

        // Listen for customEvent and log it
        newSocket.on('customEvent', (data) => {
            console.log(`Received customEvent in the client: `, data);
        });

        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, [token]);

    // Handler for form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setMatchSettings((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handler for form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Log or process the form data as needed
        console.log('Sending match request with settings:', matchSettings);
        // Optionally, send this data via socket:
        if (socket) {
            socket.emit('sendMatchSettings', {
                ...matchSettings,
                requesterId: jwtDecode(token)._id,
                requesterUsername: userDoc.username,
                requesterRating: userDoc.rating,
            });
        }
        // Close the popup after sending the request
        showPopup(false);
    };

    const configureMatch = (user) => {
        // Toggle the popup state when a user is selected for match configuration
        showPopup((prev) => !prev);
    };

    const requestMatch = (user) => {
        if (socket) {
            console.log('requesting user:', user);
            socket.emit('requestMatch', {
                userId: user.id,
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
                <div onClick={() => showPopup((prev) => !prev)} className='RPopupDivContainer'>
                    <div onClick={(e) => e.stopPropagation()} className='RPopupDiv'>
                        <div className='popupHeader'>Set Match <button onClick={() => showPopup(false)} className='closeButton'>X</button></div>
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
                        return !props.onlineOnly ? (
                            <div className={userFriend.status === "online" ? "UserFriend__container onlineUF" : "UserFriend__container offlineUF"} key={userFriend.id}>
                                <p>{index + 1}</p>
                                <div className='UserFriend__userDetails'>
                                    <div>
                                        <h3 className='UserFriend__username'>{userFriend.username}</h3>
                                        <p>
                                            <span className='userFriend__rating'>&#8902; </span>{userFriend.rating}
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
                                    onClick={() => {
                                        configureMatch(userFriend);
                                    }}
                                >
                                    <b>QUICK MATCH</b>
                                </button>
                            </div>
                        ) : userFriend.status === "online" ? (
                            <div className="UserFriend__container onlineUF" key={userFriend.id}>
                                <p>{index + 1}</p>
                                <div className='UserFriend__userDetails'>
                                    <div>
                                        <h3 className='UserFriend__username'>{userFriend.username}</h3>
                                        <p>
                                            <span className='userFriend__rating'>&#8902; </span>{userFriend.rating}
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
                                    onClick={() => {
                                        requestMatch(userFriend);
                                    }}
                                >
                                    <b>QUICK MATCH</b>
                                </button>
                            </div>
                        ) : null;
                    }) : <p>No Friends</p>
                )}
            </div>
            {requestData && (
                <div className='requestDiv'>
                    <h1 className='RHeading'>MATCH INVITE</h1>
                    <h2>Dhanush Sai <span className='RRating'>(1000)</span></h2>
                    <p><i>invited you for a match</i></p>
                    <div className='RModeDetailsDiv'>
                        <p className='RModeDetails'><b>MODE:</b> Quick Debug - JavaScript</p>
                        <p className='RModeDetails'><b>DIFFICULTY:</b> Easy</p>
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
