import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import "../styles/UserFriend.css";
import { NotUserFriend } from './NotUserFriend';

export const UserFriend = (props) => {
    const {
        userFriendsData,
        UFloading: loading,
        setUFLoading: setLoading,
    } = props

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token'); // Get the JWT token from local storage
        // Establish the socket connection
        const newSocket = io('http://localhost:3000', {
          auth: { token: token },
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
      }, []);
      

    const requestMatch = (user) => {
        if (socket) {
            console.log('requesting user:', user);
            // Emit an event to the user's room
            socket.emit('requestMatch', {
                userId: user.id,
                message: 'You have a match request!',
            });
        }
    };

    return (
        <div className='UserFriend'>
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
                                        <p><span className='userFriend__rating'>&#8902; </span>{userFriend.rating}</p>
                                    </div>
                                </div>
                                {
                                    userFriend.status === "online" ? (
                                        <div className='UserFriend__onlineBadgeDiv'>
                                            <div className='UserFriend__onlineBadge'></div>
                                            <p>Online</p>
                                        </div>
                                    ) : (
                                        <div className='UserFriend__offlineBadgeDiv'>
                                            <div className='UserFriend__offlineBadge'></div>
                                            <p>Offline</p>
                                        </div>
                                    )
                                }
                                <button
                                    className='modeBtns quickMatchBtn UserFriendQuickMatchBtn'
                                    disabled={userFriend.status !== "online"}
                                    onClick={() => {
                                        requestMatch(userFriend)
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
                                        <p><span className='userFriend__rating'>&#8902; </span>{userFriend.rating}</p>
                                    </div>
                                </div>
                                {
                                    userFriend.status === "online" ? (
                                        <div className='UserFriend__onlineBadgeDiv'>
                                            <div className='UserFriend__onlineBadge'></div>
                                            <p>Online</p>
                                        </div>
                                    ) : (
                                        <div className='UserFriend__offlineBadgeDiv'>
                                            <div className='UserFriend__offlineBadge'></div>
                                            <p>Offline</p>
                                        </div>
                                    )
                                }
                                <button
                                    className='modeBtns quickMatchBtn UserFriendQuickMatchBtn'
                                    disabled={userFriend.status !== "online"}
                                    onClick={() => {
                                        requestMatch(userFriend)
                                    }}
                                >
                                    <b>QUICK MATCH</b>
                                </button>
                            </div>
                        ) : null;
                    }) : <p>No Friends</p>
                )}
            </div>
        </div>
    );
};
