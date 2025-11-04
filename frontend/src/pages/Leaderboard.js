// Leaderboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Leaderboard.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import { useSocket } from '../SocketContext';
import { jwtDecode } from 'jwt-decode';
import Loader from './../components/Loader';
import profileImg from '../images/profile.jpg';
import { toLowQualityPic } from '../images/toLowQualityPic';
import ImageWithLoader from '../components/ImageWithLoader';

const Leaderboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [matchRequestData, setMatchRequestData] = useState(null);
  const [rejectCountdown, setRejectCountdown] = useState(10);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const { _id: userId } = jwtDecode(localStorage.getItem('token'))

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/leaderboard?page=${page}&limit=${limit}`);
        const data = await response.json();
        setLeaderboardData(data.leaderboard);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [page]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    // (Optional) Decode the token if needed for further logic
    const decodedToken = jwtDecode(token);
    // You can use decodedToken here if required

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
          currPage="leaderboard"
          matchRequestData={matchRequestData}
          rejectCountdown={rejectCountdown}
          onAccept={handleAccept}
          onReject={handleReject}
          isOpen={isNavOpen}
          onClose={closeNav}
        />
        {/* Leaderboard-specific content can go here */}
        <div className="leaderboardContent_container">

          <div className='leaderboardContent'>
            {loading ? (
              <Loader />
            ) : (
              <div id='table-responsive-wrapper' className="table-responsive-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Username</th>
                      <th>Rating</th>
                      <th>Problems Solved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((user, index) => (
                      <tr className={userId == user._id && "LB_user_row"} key={user._id}>
                        <td className={userId != user._id ? "LB_rank" : "LB_rank LB_user_row_rank"}>#{(page - 1) * limit + index + 1}</td>
                        <td className={userId == user._id ? "LB_profile_and_username LB_user_row_username" : 'LB_profile_and_username'} ><ImageWithLoader className='leaderboardProfilePic' src={user.profilePic ? toLowQualityPic(user.profilePic) : profileImg} alt={user.username} />{user.username}</td>
                        <td className={userId == user._id && "LB_user_row_rating"}>&#8902; {user.rating}</td>
                        <td className={userId == user._id && "LB_user_row_quesionSolved"}>{user.problemsSolved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
