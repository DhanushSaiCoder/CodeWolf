import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/HomeHistory.css';
import profileImg from '../images/profile.jpg';
import ImageWithLoader from './ImageWithLoader';
import { toLowQualityPic } from './../images/toLowQualityPic';

export const HomeHistory = () => {
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setCurrentUser(decodedToken);
            } catch (e) {
                console.error("Invalid token:", e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to see your match history.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/matches/history`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch match history');
                }

                const result = await response.json();
                setMatches(result.matches);
            } catch (error) {
                console.error('Error:', error);
                setError('Failed to load match history.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchHistory();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const getMatchResult = (match) => {
        if (match.winner === null) return 'draw';
        return match.winner === currentUser.userId ? 'win' : 'loss';
    };

    const getOpponent = (match) => {
        if (!currentUser || !match.players || match.players.length < 2) {
            return null;
        }
        const opponent = match.players.find(p => p.id && p.id._id !== currentUser.userId);
        return opponent;
    };

    return (
        <div className='homeHistoryContainer'>
            <div className='HomeHistory'>
                <div className='HomeHistoryHeader'>
                    <h2>Match History</h2>
                </div>
                {loading ? (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <ul className='homeHistoryContent' style={{ listStyleType: 'none', padding: 0 }}>
                        {matches && matches.length > 0 ? matches.slice(0, 10).map((match) => {
                            const opponent = getOpponent(match);
                            if (!opponent) return <li key={match._id}>Invalid match data</li>;
                            
                            const result = getMatchResult(match);

                            return (
                                <li className='historyItem' key={match._id}>
                                    <p className='h_profile_and_username'>
                                        <ImageWithLoader className='h-profile-pic' src={opponent.profilePic ? toLowQualityPic(opponent.profilePic) : profileImg} alt={opponent.username} />
                                        <b>{opponent.username}</b>
                                    </p>
                                    <div className={`historyResult ${result}`}>
                                        {result}
                                    </div>
                                </li>
                            );
                        }) : <p style={{textAlign: 'center', marginTop: '20px'}}>No match history found.</p>}
                    </ul>
                )}
                {!loading && matches && matches.length > 0 && (
                    <button className='showMoreBtn' onClick={() => navigate('/history')}>
                        View More
                    </button>
                )}
            </div>
        </div>
    );
};
