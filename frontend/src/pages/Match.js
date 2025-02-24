import { get } from 'mongoose';
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom';

const useQuery = () => new URLSearchParams(useLocation().search);
export default function Match() {
  //function to get the match doc with the match id from the url params.
  const query = useQuery();
  const matchId = query.get('matchId');

  useEffect(() => {
    fetch(`http://localhost:5000/matches/${matchId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('matchDoc: ', data);
      })
      .catch(err => {
        console.log(err);
      })
  })


  return (
    <div>Match</div>
  )

}

