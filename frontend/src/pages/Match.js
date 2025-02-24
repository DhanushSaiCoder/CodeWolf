import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../styles/Match.css";

import MatchLeftColumn from '../components/MatchLeftColumn';
import MatchRightColumn from '../components/MatchRightColumn';

const useQuery = () => new URLSearchParams(useLocation().search);

export default function Match() {
  const query = useQuery();
  const matchId = query.get('matchId');
  const [matchDoc, setMatchDoc] = useState(null);

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
      {/* Match: {matchDoc ? JSON.stringify(matchDoc) : "Loading..."} */}
      <MatchLeftColumn matchDoc={JSON.stringify(matchDoc)} />
      <MatchRightColumn matchDoc={JSON.stringify(matchDoc)} />
    </div>
  )
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
