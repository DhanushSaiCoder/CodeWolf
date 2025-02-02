import React from 'react';
import "../styles/HomeLeaderBoard.css";
import bronze from '../images/bronze.png';
import gold from '../images/gold.png';
import silver from '../images/silver.png';
import { useNavigate } from 'react-router-dom';

export const HomeLeaderBoard = () => {
    const navigate = useNavigate()
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
        }
    ];

    const sortByRating = (data) => {
        return data.sort((a, b) => b.rating - a.rating);
    };

    data = sortByRating(data);
    console.log('data', data);

    const medals = [gold, silver, bronze];

    return (
        <div className='homeLeaderBoardContainer'>
            <div className='HomeLeaderBoard'>
                <div className='HomeLeaderBoardHeader'>
                    <h2>Leaderboard</h2>
                </div>
                <div className='homeLeaderBoardContent'>
                    {data.map((u, index) => (
                        index < 10 ? (
                            <div className={`lbUser ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`} key={index}>
                                <p>{index + 1}</p>
                                <p><b>{u.username}</b></p>
                                {index < 3 ? <img className='hlbBadge' height="35px" width="35px" src={medals[index]} alt={`${index + 1} place`} /> : <></>}
                                <div className='hlbRating'>

                                    <p><span className='starSymbol'>&#8902; </span>{u.rating}</p>
                                </div>
                            </div>
                        ) : null
                    ))}
                    <button className='showMoreBtn' onClick={() => {
                        navigate('/leaderboard')
                    }}>Show More</button>
                </div>
            </div>
        </div>
    );
};
