import React, { Component } from 'react';
import "../styles/HomeLeaderBoard.css"

export const HomeLeaderBoard = () => {

    let data = [
        {
            username: 'Dhanush Sai',
            rating: 1231
        },
        {
            username: "Nikhil",
            rating: 1201
        },
        {
            username: "Subhash",
            rating: 1132
        },
        {
            username: "Ananya",
            rating: 1256
        },
        {
            username: "Harshita",
            rating: 1189
        },
        {
            username: "Rohit",
            rating: 1224
        },
        {
            username: "Kavya",
            rating: 1210
        },
        {
            username: "Amit",
            rating: 1193
        },
        {
            username: "Sneha",
            rating: 1157
        },
        {
            username: "Vikram",
            rating: 1178
        },
        ,
        {
            username: "Kavya",
            rating: 1210
        },
        {
            username: "Amit",
            rating: 1193
        },
        {
            username: "Sneha",
            rating: 1157
        },
        {
            username: "Vikram",
            rating: 1178
        }
    ];
    data = data.sort((a, b) => b.rating - a.rating)
    console.log('data', data)
    return (
        <div className='HomeLeaderBoard'>
            <div className='HomeLeaderBoardHeader'>
                <h2>Leaderboard</h2>
            </div>
            <div className='HomeLeaderBoardContent'>

                {data.map((u, index) => {
                    return (
                        <div className='lbUser'>
                            <p>{index + 1}</p>
                            <p><b>{u.username}</b></p>
                            <p>{u.rating}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}