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
        }, 15000); // 15 seconds

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
    }, [socket, navigate, matchSettings.mode, matchSettings.difficulty, matchSettings.language]); // More stable dependencies

    const handleWhatsAppInvite = () => {
        const token = localStorage.getItem('token');
        const requesterId = jwtDecode(token)._id;

        const inviteLink = `${process.env.REACT_APP_FRONTEND_URL}/waInviteWait?requesterId=${requesterId}&difficulty=${matchSettings.difficulty}&language=${matchSettings.language}&mode=${matchSettings.mode}`;
        const message = `Let's have a CodeWolf match!\n\nLanguage: ${matchSettings.language}\nDifficulty: ${matchSettings.difficulty}\nMode: ${matchSettings.mode}\n\nJoin me here:\n${inviteLink}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

        navigate(`/waInviteWait?requesterId=${requesterId}&difficulty=${matchSettings.difficulty}&language=${matchSettings.language}&mode=${matchSettings.mode}`, { replace: true });

        window.open(whatsappUrl, '_blank');
    };

    const handleCancel = () => {
        if (socket) {
            socket.emit('cancelFindMatch');
        }
        navigate('/', { replace: true });
    };

    return (
        <div className='FindMatch'>
            <div className="FM-content-container">
                {!showInviteHint && <>
                    <div>Finding Match...</div>
                    <div className="FM-spinner"></div>
                </>}

                {showInviteHint && (
                    <div className="FM-invite-hint">
                        <p>No players seem to be available right now.</p>
                        <button onClick={handleWhatsAppInvite} className="FM-whatsapp-btn">
                            Invite a Friend
                        </button>
                    </div>
                )}

                <button onClick={handleCancel} className="FM-cancel-btn">Cancel</button>
            </div>
        </div>
    );
};

export default FindMatch;