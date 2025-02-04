import React, { Component } from 'react';
import "../styles/NotUserFriend.css";
import addFriend from "../images/add-friend.png"
export const NotUserFriend = () => {
    const notUserFriendsData = [
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
    return (<div className='NotUserFriend'>
        <h4 style={{marginBottom: "10px"}}>OTHER USERS</h4>
        <div className='NUF_data'>
            {notUserFriendsData.map((notUserFriend, index) => {
                return(<div className="UserFriend__container" key={notUserFriend.id}>
                    <p>{index + 1}</p>
                    <div className='NotUserFriend__userDetails'>
                        <div>
                            <h3 className='NotUserFriend__username'>{notUserFriend.username}</h3>
                            <p><span className='NotUserFriend__rating'>&#8902; </span>{notUserFriend.rating}</p>
                        </div>
                    </div>
                   
                    <button
                        className='inviteFriendBtn quickMatchBtn NotUserFriendQuickMatchBtn'
                        disabled={!notUserFriend.online}
                    >
                        <img src={addFriend} alt="add friend icon" />
                    </button>
                </div>)
            })}
        </div>
    </div>);
}