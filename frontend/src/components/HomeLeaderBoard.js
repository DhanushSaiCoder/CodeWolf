import React, { useEffect, useState } from 'react';
import "../styles/HomeLeaderBoard.css";
import bronze from '../images/bronze.png';
import gold from '../images/gold.png';
import silver from '../images/silver.png';
import profileImg from '../images/profile.jpg';
import { useNavigate } from 'react-router-dom';
import { toLowQualityPic } from '../images/toLowQualityPic';
import ImageWithLoader from './ImageWithLoader';

export const HomeLeaderBoard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch users from the backend
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/users`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch users');
                return response.json();
            })
            .then(result => {
                setData(result); // Backend already sorts the data
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Failed to load leaderboard data.');
            })
            .finally(() => setLoading(false));
    }, []);

    // Medals for top 3 users
    const medals = [gold, silver, bronze];

    return (
        <div className='homeLeaderBoardContainer'>
            <div className='HomeLeaderBoard'>
                <div className='HomeLeaderBoardHeader'>
                    <h2>Leaderboard</h2>
                </div>
                {loading ? (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <ol className='homeLeaderBoardContent' style={{ listStyleType: 'none', padding: 0 }}>
                        {data.slice(0, 10).map((u, index) => (
                            <li className={`lbUser ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`} key={index}>
                                <p>{index + 1}</p>
                                <p className='hlb_profile_and_username'>
                                    <ImageWithLoader className='hlbProfilePic' src={u.profilePic ? toLowQualityPic(u.profilePic) : profileImg} alt={u.username} />
                                    <b>{u.username}</b>
                                    {index < 3 && <img className='hlbBadge' height="35px" width="35px" src={medals[index]} alt={`${index + 1} place medal`} />}</p>

                                <div className='hlbRating'>
                                    <p><span className='starSymbol'>&#8902; </span>{u.rating}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
                {!loading && (
                    <button id='showMoreBtn' className='showMoreBtn' onClick={() => navigate('/leaderboard')}>
                        Show More
                    </button>
                )
                }
            </div>
        </div>
    );
};