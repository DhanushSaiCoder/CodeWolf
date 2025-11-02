// History.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/History.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { useSocket } from '../SocketContext';
import { jwtDecode } from 'jwt-decode';

const History = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [matchRequestData, setMatchRequestData] = useState(null);
  const [rejectCountdown, setRejectCountdown] = useState(10);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/matches/history?page=${page}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setHistoryData(data.matches);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching history:', error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    // Optionally decode the token if needed
    const decodedToken = jwtDecode(token);
    // (You can use decodedToken here if needed)

    if (socket) {
      // Listen for incoming match requests
      const handleMatchRequest = (data) => {
        console.log('Received match request:', data);
        setMatchRequestData(data);

        // Automatically reject the match request after 10 seconds if no action is taken
        setTimeout(() => {
          if (data && socket) {
            console.log('Auto-rejecting match request:', data);
            socket.emit('requestRejected', data);
          }
          setMatchRequestData(null);
        }, 10000);
      };

      socket.on('sendMatchRequest', handleMatchRequest);

      return () => {
        socket.off('sendMatchRequest', handleMatchRequest);
      };
    }
  }, [navigate, socket]);

  // Manage the auto‑reject countdown for match requests
  useEffect(() => {
    if (matchRequestData) {
      setRejectCountdown(10);
      const interval = setInterval(() => {
        setRejectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [matchRequestData]);

  // Handler for accepting a match request
  const handleAccept = () => {
    // Add your accept logic here (e.g., notify the server, redirect to match page, etc.)
    console.log("Match accepted", matchRequestData);

    socket.emit('requestAccepted', matchRequestData);
    navigate(`/matchwait/?requesterId=${matchRequestData.requesterId}&receiverId=${matchRequestData.userId}&mode=${encodeURI(matchRequestData.mode)}&difficulty=${matchRequestData.difficulty}&language=${matchRequestData.programmingLanguage}`)


    setMatchRequestData(false);
  };

  // Handler for rejecting a match request
  const handleReject = () => {
    if (socket && matchRequestData) {
      socket.emit('requestRejected', matchRequestData);
    }
    setMatchRequestData(false);
  };

  return (
    <div className='Home'>
      <Header onNavToggle={toggleNav} />
      <div className='homeContent'>
        <Nav
          currPage="history"
          matchRequestData={matchRequestData}
          rejectCountdown={rejectCountdown}
          onAccept={handleAccept}
          onReject={handleReject}
          isOpen={isNavOpen}
          onClose={closeNav}
        />
        <div className="historyContent_container">
          <div className='historyContent'>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className='history_page_table_wrapper'>
                <table>
                  <thead>
                    <tr>
                      <th>Opponent</th>
                      <th>Result</th>
                      <th>Rating Change</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((match) => {
                      const currentUser = jwtDecode(localStorage.getItem('token'));
                      const opponent = match.players.find(p => p.id._id !== currentUser._id);
                      const result = match.winner === currentUser._id ? 'Win' : match.loser === currentUser._id ? 'Loss' : 'Draw';
                      const ratingChange = match.winner === currentUser._id ? match.winner_rating_delta || "N/A" : match.loser_rating_delta || "N/A"; // This is a placeholder, need to get actual rating change

                      const formatRelativeTime = (dateString) => {
                        const date = new Date(dateString);
                        const now = new Date();
                        const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
                        const minutes = Math.round(seconds / 60);
                        const hours = Math.round(minutes / 60);
                        const days = Math.round(hours / 24);
                        const months = Math.round(days / 30);
                        const years = Math.round(days / 365);

                        if (seconds < 60) return `${seconds} seconds ago`;
                        if (minutes < 60) return `${minutes} minutes ago`;
                        if (hours < 24) return `${hours} hours ago`;
                        if (days < 30) return `${days} days ago`;
                        if (months < 12) return `${months} months ago`;
                        return `${years} years ago`;
                      };

                      return (
                        <tr key={match._id}>
                          <td>{opponent ? opponent.id.username : 'N/A'}</td>
                          <td className={`result-${result.toLowerCase()}`}>{result}</td>
                          <td className={`rating-${result.toLowerCase()}`}>{ratingChange > 0 ? `+${ratingChange}` : ratingChange}</td>
                          <td>{formatRelativeTime(match.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pagination-controls">
              <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                &lt; Previous
              </button>
              <span>{page} / {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
