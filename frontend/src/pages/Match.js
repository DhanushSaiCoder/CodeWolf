import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../styles/Match.css";
import { useSocket } from '../SocketContext';
import MatchLeftColumn from '../components/MatchLeftColumn';
import MatchRightColumn from '../components/MatchRightColumn';
import YouLose from '../components/YouLose';

const useQuery = () => new URLSearchParams(useLocation().search);


export default function Match() {
  const query = useQuery();
  const matchId = query.get('matchId');
  const [matchDoc, setMatchDoc] = useState(null);
  const [question, setQuestion] = useState(null)
  const [matchEnded, setMatchEnded] = useState(false)
  const socket = useSocket()

  //useEffect with socket listener that listens to 'matchEnded' event fromt the server
  useEffect(() => {
    if (!socket) return;

    const handleMatchEnded = ({ match }) => {
      console.log("Ended match data:", match);
      setMatchEnded(true)
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
    setMatchEnded(false)
  }

  const handle_goHomeClick = () => {
    window.location.href = "/"
  }

  return (
    <>
      {matchEnded && (<YouLose handle_continueSolvingClick={handle_continueSolvingClick} handle_goHomeClick={handle_goHomeClick}/>)}
      <div className='Match'>
        <MatchLeftColumn matchDoc={JSON.stringify(matchDoc)} matchId={matchId} handleQuestionFound={handleQuestionFound} />
        <MatchRightColumn question={question} matchDoc={matchDoc} />
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