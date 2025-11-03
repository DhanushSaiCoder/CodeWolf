import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../SocketContext';
import '../styles/FindMatch.css';
import { jwtDecode } from 'jwt-decode';

const useQuery = () => new URLSearchParams(useLocation().search);

const FindMatch = () => {
    const query = useQuery();
    const navigate = useNavigate();
    const socket = useSocket();
    const [showInviteHint, setShowInviteHint] = useState(false);

    const matchSettings = {
        mode: query.get('mode'),
        difficulty: query.get('difficulty'),
        language: query.get('language'),
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowInviteHint(true);
        }, 20000); // 20 seconds

        if (socket) {
            socket.emit('findMatch', matchSettings);

            const handlePlayersFound = ({ player1, player2, matchSettings }) => {
                const { _id } = jwtDecode(localStorage.getItem('token'));
                const requesterId = player1.id === _id ? player1.id : player2.id;
                const receiverId = player1.id === _id ? player2.id : player1.id;

                navigate(`/matchwait?requesterId=${requesterId}&receiverId=${receiverId}&mode=${matchSettings.mode}&difficulty=${matchSettings.difficulty}&language=${matchSettings.language}`, { replace: true });
            };

            socket.on('playersFound', handlePlayersFound);

            return () => {
                socket.off('playersFound', handlePlayersFound);
                clearTimeout(timer);
            };
        }

        return () => clearTimeout(timer);
        return () => clearTimeout(timer);
    }, [socket, navigate, matchSettings]);

    const handleWhatsAppInvite = () => {
        const token = localStorage.getItem('token');
        const requesterId = jwtDecode(token)._id;

        const inviteLink = `${process.env.REACT_APP_FRONTEND_URL}/waInviteWait?requesterId=${requesterId}&difficulty=${matchSettings.difficulty}&language=${matchSettings.language}&mode=${matchSettings.mode}`;
        const message = `Let's have a CodeWolf match!\n\nLanguage: ${matchSettings.language}\nDifficulty: ${matchSettings.difficulty}\nMode: ${matchSettings.mode}\n\nJoin me here:\n${inviteLink}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        
        // First, navigate the inviter to the waiting page
        navigate(`/waInviteWait?requesterId=${requesterId}&difficulty=${matchSettings.difficulty}&language=${matchSettings.language}&mode=${matchSettings.mode}`, { replace: true });

        // Then, open the WhatsApp share link
        window.open(whatsappUrl, '_blank');
    };

    const handleCancel = () => {
        if (socket) {
            socket.emit('cancelFindMatch');
        }
        navigate('/', { replace: true });
    };

    return (
        <div className="find-match-container">
            <div className="find-match-box">
                <h2>Finding Match...</h2>
                <p>Mode: {matchSettings.mode}</p>
                <p>Difficulty: {matchSettings.difficulty}</p>
                <p>Language: {matchSettings.language}</p>
                <div className="spinner"></div>
                {showInviteHint && (
                    <div className="invite-hint">
                        <p>No players seem to be available right now.</p>
                        <button onClick={handleWhatsAppInvite} className="whatsapp-btn">Invite a Friend</button>
                    </div>
                )}
                <button onClick={handleCancel} className="cancel-btn">Cancel</button>
            </div>
        </div>
    );
};

export default FindMatch;
