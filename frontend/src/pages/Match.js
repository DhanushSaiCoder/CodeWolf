import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../styles/Match.css";
import { useSocket } from '../SocketContext';
import MatchLeftColumn from '../components/MatchLeftColumn';
import MatchRightColumn from '../components/MatchRightColumn';
import YouLose from '../components/YouLose';
import YouWin from '../components/YouWin';
import MatchDraw from '../components/MatchDraw';
import MatchInfo from '../components/MatchInfo';
import Timer from '../components/Timer';
import QuestionDetails from '../components/QuestionDetails';

const useQuery = () => new URLSearchParams(useLocation().search);


export default function Match() {
  const query = useQuery();
  const matchId = query.get('matchId');
  const [matchDoc, setMatchDoc] = useState(null);
  const [question, setQuestion] = useState(null)
  const [matchLost, setMatchLost] = useState(JSON.parse(localStorage.getItem(`matchLost?${matchId}`)) || false)
  const [userWonMatch, setUserWonMatch] = useState(JSON.parse(localStorage.getItem(`matchWon?${matchId}`)) || false)
  const [timeUp, setTimeUp] = useState(false)
  const [showTimer, setShowTimer] = useState(true)
  const [showYouLose, setShowYouLose] = useState(false)
  const [showYouWin, setShowYouWin] = useState(false)
  const [showMatchDraw, setShowMatchDraw] = useState(false)
  const [loser_rating_delta, set_loser_rating_delta] = useState(JSON.parse(localStorage.getItem(`loserRatingDelta?${matchId}`)) || 0)
  const [winnerRatingChange, setWinnerRatingChange] = useState(JSON.parse(localStorage.getItem(`winnerRatingChange?${matchId}`)) || null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState('Question');

  const socket = useSocket()

  const matchCompleted = timeUp || matchLost || userWonMatch;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  //useEffect with socket listener that listens to 'matchEnded' event fromt the server
  useEffect(() => {
    if (!socket) return;

    const handleMatchEnded = ({ match, loser_rating_delta }) => {
      console.log("Ended match data:", match);
      localStorage.setItem(`matchLost?${matchId}`, JSON.stringify(true))
      localStorage.setItem(`loserRatingDelta?${matchId}`, JSON.stringify(loser_rating_delta))
      set_loser_rating_delta(loser_rating_delta)
      setMatchLost(true)
    };

    socket.on('matchEnded', handleMatchEnded);

    // Cleanup the event listener on component unmount
    return () => {
      socket.off('matchEnded', handleMatchEnded);
    };
  }, [socket]);

  // When the component mounts, store matchId with the current start time
  useEffect(() => {
    const storedData = localStorage.getItem('matchStartData');
    if (storedData) {
      const { matchId: storedMatchId } = JSON.parse(storedData);
      if (storedMatchId !== matchId) {
        // If the matchId doesn't match, reset the stored data
        const now = new Date();
        const hour = now.getHours();
        const min = now.getMinutes();
        const sec = now.getSeconds();
        localStorage.setItem('matchStartData', JSON.stringify({ matchId, hour, min, sec }));
      }
    } else {
      // If nothing stored, store new data
      const now = new Date();
      const hour = now.getHours();
      const min = now.getMinutes();
      const sec = now.getSeconds();
      localStorage.setItem('matchStartData', JSON.stringify({ matchId, hour, min, sec }));
    }
  }, [matchId]);

  useEffect(() => {
    const fetchMatchDoc = async () => {
      const data = await getMatchDoc(matchId);
      console.log("matchDoc: ", data);
      setMatchDoc(data);
    };

    if (matchId) {
      fetchMatchDoc();
    }
  }, [matchId]);

  useEffect(() => {
    if (matchLost) {
      setShowYouLose(true);
    }
  }, [matchLost]);

  useEffect(() => {
    if (userWonMatch) {
      setShowYouWin(true);
    }
  }, [userWonMatch]);

  useEffect(() => {
    if (timeUp) {
      setShowMatchDraw(true);
    }
  }, [timeUp]);

  const handleQuestionFound = (question) => {
    setQuestion(question)
  }

  const handle_continueSolvingClick = () => {
    setShowYouLose(false)
  }

  const handle_goHomeClick = () => {
    window.location.href = "/"
  }

  const handleUserWonMatch = (userId) => {
    localStorage.setItem(`matchWon?${matchId}`, true)
    setUserWonMatch(true)
  }

  const handleCloseYouWin = () => {
    setShowYouWin(false)
  }

  const handleCloseYouLose = () => {
    setShowYouLose(false)
  }

  const handleTimeUp = () => {
    // MATCH END LOGIC...!
    if(socket)
    socket.emit("drawMatch",matchDoc)
    setTimeUp(true)
    setShowTimer(false)
  }

  const handleClick_matchDraw_continueSolving = () => {
    setShowMatchDraw(false)
  }

  const handleClick_matchDraw_goHome = () => {
    window.location.href = "/"
  }

  const handleGotWinnerRatingChange = (rating, delta) => {
    const newWinnerRatingChange = [rating, delta];
    setWinnerRatingChange(newWinnerRatingChange);
    localStorage.setItem(`winnerRatingChange?${matchId}`, JSON.stringify(newWinnerRatingChange));
  }

  const renderMobileView = () => (
    <div className='Match'>
      <MatchInfo matchDoc={JSON.stringify(matchDoc)} />
      {showTimer && !matchCompleted && (<Timer matchId={matchId} time={15} handleTimeUp={handleTimeUp} />)}
      <div className="match-mobile-tabs">
        <button onClick={() => setActiveTab('Question')} className={`match-tab-button ${activeTab === 'Question' ? 'active' : ''}`}>Question</button>
        <button onClick={() => setActiveTab('Code')} className={`match-tab-button ${activeTab === 'Code' ? 'active' : ''}`}>Code</button>
      </div>
      {activeTab === 'Question' ? (
        <QuestionDetails isMobile={isMobile} matchDoc={JSON.stringify(matchDoc)} handleQuestionFound={handleQuestionFound} />
      ) : (
        <MatchRightColumn isMobile={isMobile} question={question} matchDoc={matchDoc} handleUserWonMatch={handleUserWonMatch} timeUp={timeUp} matchLost={matchLost} userWonMatch={userWonMatch} handleGotWinnerRatingChange={handleGotWinnerRatingChange}/>
      )}
    </div>
  );

  const renderDesktopView = () => (
    <div className='Match'>
      <MatchLeftColumn showTimer={showTimer} matchDoc={JSON.stringify(matchDoc)} matchId={matchId} handleTimeUp={handleTimeUp} handleQuestionFound={handleQuestionFound} matchCompleted={matchCompleted} />
      <MatchRightColumn question={question} matchDoc={matchDoc} handleUserWonMatch={handleUserWonMatch} timeUp={timeUp} matchLost={matchLost} userWonMatch={userWonMatch} handleGotWinnerRatingChange={handleGotWinnerRatingChange}/>
    </div>
  );

  return (
    <> 
      {showYouLose && (<YouLose matchDoc={matchDoc} loser_rating_delta={loser_rating_delta} handleCloseYouLose={handleCloseYouLose} handle_continueSolvingClick={handle_continueSolvingClick} handle_goHomeClick={handle_goHomeClick} />)}
      {showYouWin && (<YouWin winnerRatingChange={winnerRatingChange || [0,0]} handleCloseYouWin={handleCloseYouWin} />)}
      {showMatchDraw && (<MatchDraw handleClick_matchDraw_continueSolving={handleClick_matchDraw_continueSolving} handleClick_matchDraw_goHome={handleClick_matchDraw_goHome}/>)}
      {isMobile ? renderMobileView() : renderDesktopView()}
    </>
  );
}

const getMatchDoc = async (matchId) => {
  try {
    const response = await fetch(`http://localhost:5000/matches/${matchId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error(`Error fetching match: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};