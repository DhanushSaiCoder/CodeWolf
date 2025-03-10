import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../styles/Match.css";

import MatchLeftColumn from '../components/MatchLeftColumn';
import MatchRightColumn from '../components/MatchRightColumn';

const useQuery = () => new URLSearchParams(useLocation().search);

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

export default function Match() {
  const query = useQuery();
  const matchId = query.get('matchId');
  const [matchDoc, setMatchDoc] = useState(null);

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

  return (
    <div className='Match'>
      <MatchLeftColumn matchDoc={JSON.stringify(matchDoc)} matchId={matchId} />
      <MatchRightColumn matchDoc={JSON.stringify(matchDoc)} />
    </div>
  );
}
