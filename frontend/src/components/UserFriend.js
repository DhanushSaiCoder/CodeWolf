import React from 'react';
import "../styles/UserFriend.css";
import { NotUserFriend } from './NotUserFriend';

export const UserFriend = (props) => {
    const userFriendsData = [
        { id: 1, username: 'John Doe', rating: 1321, online: true },
        { id: 2, username: 'Jane Doe', rating: 1234, online: false },
        { id: 3, username: 'John Smith', rating: 1000, online: true },
        { id: 4, username: 'Jane Smith', rating: 900, online: false },
        { id: 5, username: 'John Johnson', rating: 800, online: true },
        { id: 6, username: 'Jane Johnson', rating: 700, online: false },
        { id: 7, username: 'John Brown', rating: 600, online: true },
        { id: 8, username: 'Jane Brown', rating: 500, online: false },
        { id: 9, username: 'John White', rating: 400, online: true },
        { id: 10, username: 'Jane White', rating: 300, online: false }
    ];

    // Sort the array so online users appear first
    userFriendsData.sort((a, b) => b.online - a.online);

    return (
        <div className='UserFriend'>
            <div className='data'>
                <h4>FRIENDS</h4>

                {userFriendsData.map((userFriend, index) => {
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
                })}
            </div>
        </div>
    );
};
