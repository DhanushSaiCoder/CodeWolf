import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../SocketContext';
import '../styles/FindMatch.css';
import { jwtDecode } from 'jwt-decode';

const useQuery = () => new URLSearchParams(useLocation().search);

const FindMatch = () => {
    const query = useQuery();
    const navigate = useNavigate();
    const socket = useSocket();

    const matchSettings = {
        mode: query.get('mode'),
        difficulty: query.get('difficulty'),
        language: query.get('language'),
    };

    useEffect(() => {
        if (socket) {
            socket.emit('findMatch', matchSettings);

            const handlePlayersFound = ({ player1, player2, matchSettings }) => {
                const { _id } = jwtDecode(localStorage.getItem('token'));
                const requesterId = player1.id === _id ? player1.id : player2.id;
                const receiverId = player1.id === _id ? player2.id : player1.id;

                navigate(`/matchwait?requesterId=${requesterId}&receiverId=${receiverId}&mode=${matchSettings.mode}&difficulty=${matchSettings.difficulty}&language=${matchSettings.language}`);
            };

            socket.on('playersFound', handlePlayersFound);

            return () => {
                socket.off('playersFound', handlePlayersFound);
            };
        }
    }, [socket, navigate, matchSettings]);

    const handleCancel = () => {
        if (socket) {
            socket.emit('cancelFindMatch');
        }
        navigate('/');
    };

    return (
        <div className="find-match-container">
            <div className="find-match-box">
                <h2>Finding Match...</h2>
                <p>Mode: {matchSettings.mode}</p>
                <p>Difficulty: {matchSettings.difficulty}</p>
                <p>Language: {matchSettings.language}</p>
                <div className="spinner"></div>
                <button onClick={handleCancel} className="cancel-btn">Cancel</button>
            </div>
        </div>
    );
};

export default FindMatch;
