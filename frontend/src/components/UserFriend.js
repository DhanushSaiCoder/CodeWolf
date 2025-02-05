import React, { useState, useEffect } from 'react';
import "../styles/UserFriend.css";
import { NotUserFriend } from './NotUserFriend';

export const UserFriend = (props) => {

    const [userFriendsData, setUserFriendsData] = useState([]);
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(data => {
                data.friends.sort((a, b) => b.online - a.online);
                // setUserFriendsData(data.friends);
                console.log(data)
                setLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false);
            });
    }, []);

    return (
        <div className='UserFriend'>
            <div className='data'>
                <h4>FRIENDS</h4>
                {loading ? <p>Loading...</p> : (
                    userFriendsData.length ? userFriendsData.map((userFriend, index) => {
                        return !props.onlineOnly ? (
                            <div className={userFriend.online ? "UserFriend__container onlineUF" : "UserFriend__container offlineUF"} key={userFriend.id}>
                                <p>{index + 1}</p>
                                <div className='UserFriend__userDetails'>
                                    <div>
                                        <h3 className='UserFriend__username'>{userFriend.username}</h3>
                                        <p><span className='userFriend__rating'>&#8902; </span>{userFriend.rating}</p>
                                    </div>
                                </div>
                                {
                                    userFriend.online ? (
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
                                    disabled={!userFriend.online}
                                >
                                    <b>QUICK MATCH</b>
                                </button>
                            </div>
                        ) : userFriend.online ? (
                            <div className="UserFriend__container onlineUF" key={userFriend.id}>
                                <p>{index + 1}</p>
                                <div className='UserFriend__userDetails'>
                                    <div>
                                        <h3 className='UserFriend__username'>{userFriend.username}</h3>
                                        <p><span className='userFriend__rating'>&#8902; </span>{userFriend.rating}</p>
                                    </div>
                                </div>
                                {
                                    userFriend.online ? (
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
                                    disabled={!userFriend.online}
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
