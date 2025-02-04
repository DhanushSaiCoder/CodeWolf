import React, { Component } from 'react';
import "../styles/UserFriend.css";
import { NotUserFriend } from './NotUserFriend';
export const UserFriend = () => {

    const userFriendsData = [
        {
            id: 1,
            username: 'John Doe',
            rating: 1321
        },
        {
            id: 2,
            username: 'Jane Doe',
            rating: 1234
        },
        {
            id: 3,
            username: 'John Smith',
            rating: 1000
        },
        {
            id: 4,
            username: 'Jane Smith',
            rating: 900
        },
        {
            id: 5,
            username: 'John Johnson',
            rating: 800
        },
        {
            id: 6,
            username: 'Jane Johnson',
            rating: 700
        },
        {
            id: 7,
            username: 'John Brown',
            rating: 600
        },
        {
            id: 8,
            username: 'Jane Brown',
            rating: 500
        },
        {
            id: 9,
            username: 'John White',
            rating: 400
        },
        {
            id: 10,
            username: 'Jane White',
            rating: 300
        },
        {
            id: 8,
            username: 'Jane Brown',
            rating: 500
        },
        {
            id: 9,
            username: 'John White',
            rating: 400
        },
        {
            id: 10,
            username: 'Jane White',
            rating: 300
        },
        {
            id: 8,
            username: 'Jane Brown',
            rating: 500
        },
        {
            id: 9,
            username: 'John White',
            rating: 400
        },
        {
            id: 10,
            username: 'Jane White',
            rating: 300
        }
    ]

    return (
        <div className='UserFriend'>
            <div className='data'>
                <h4>FRIENDS</h4>

                {userFriendsData.map((userFriend, index) => {
                    return (
                        <div className='UserFriend__container' key={userFriend.id}>
                            <p>{index + 1}</p>
                            <h3 className='UserFriend__username'>{userFriend.username}</h3>
                            <p><span className='userFriend__rating'>&#8902; </span>{userFriend.rating}</p>
                            <button className='modeBtns quickMatchBtn UserFriendQuichMatchBtn'><b>QUICK MATCH</b></button>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}