import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../styles/Match.css";
import { useSocket } from '../SocketContext';
import MatchLeftColumn from '../components/MatchLeftColumn';
import MatchRightColumn from '../components/MatchRightColumn';
import YouLose from '../components/YouLose';
import YouWin from '../components/YouWin';
import MatchDraw from '../components/MatchDraw';

const useQuery = () => new URLSearchParams(useLocation().search);


export default function Match() {
  const query = useQuery();
  const matchId = query.get('matchId');
  const [matchDoc, setMatchDoc] = useState(null);
  const [question, setQuestion] = useState(null)
  const [matchLost, setMatchLost] = useState(JSON.parse(localStorage.getItem(`matchLost?${matchId}`)) || false)
  const [userWonMatch, setUserWonMatch] = useState(JSON.parse(localStorage.getItem(`matchWon?${matchId}`)) || false)
  const [timeUp, setTimeUp] = useState(false)

  const socket = useSocket()

  //useEffect with socket listener that listens to 'matchEnded' event fromt the server
  useEffect(() => {
    if (!socket) return;

    const handleMatchEnded = ({ match }) => {
      console.log("Ended match data:", match);
      localStorage.setItem(`matchLost?${matchId}`, JSON.stringify(true))
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

  const handleQuestionFound = (question) => {
    setQuestion(question)
  }

  const handle_continueSolvingClick = () => {
    setMatchLost(false)
  }

  const handle_goHomeClick = () => {
    window.location.href = "/"
  }

  const handleUserWonMatch = (userId) => {
    localStorage.setItem(`matchWon?${matchId}`, true)
    setUserWonMatch(true)
  }

  const handleCloseYouWin = () => {
    setUserWonMatch(false)
  }

  const handleCloseYouLose = () => {
    setMatchLost(false)
  }

  const handleTimeUp = () => {
    // MATCH END LOGIC...!
    if(socket)
    socket.emit("drawMatch",matchDoc)
    setTimeUp(true)
  }

  const handleClick_matchDraw_continueSolving = () => {
    setTimeUp(false)
  }

  const handleClick_matchDraw_goHome = () => {
    window.location.href = "/"
  }
  return (
    <>
      {matchLost && (<YouLose handleCloseYouLose={handleCloseYouLose} handle_continueSolvingClick={handle_continueSolvingClick} handle_goHomeClick={handle_goHomeClick} />)}
      {userWonMatch && (<YouWin handleCloseYouWin={handleCloseYouWin} />)}
      {timeUp && (<MatchDraw handleClick_matchDraw_continueSolving={handleClick_matchDraw_continueSolving} handleClick_matchDraw_goHome={handleClick_matchDraw_goHome}/>)}
      <div className='Match'>
        <MatchLeftColumn matchDoc={JSON.stringify(matchDoc)} matchId={matchId} handleTimeUp={handleTimeUp} handleQuestionFound={handleQuestionFound} />
        <MatchRightColumn question={question} matchDoc={matchDoc} handleUserWonMatch={handleUserWonMatch} />
      </div>
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