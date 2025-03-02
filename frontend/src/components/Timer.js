import React, { useState, useEffect } from 'react';
import "../styles/Timer.css";

export default function Timer({ matchId, time = 15 }) {
  let hour = 0, min = 0, sec = 0;
  const storedData = localStorage.getItem('matchStartData');
  
  if (storedData) {
    const parsedData = JSON.parse(storedData);
    if (parsedData.matchId === matchId) {
      hour = parsedData.hour;
      min = parsedData.min;
      sec = parsedData.sec;
    } else {
      // If stored matchId doesn't match, reset the stored time with the new matchId
      const now = new Date();
      hour = now.getHours();
      min = now.getMinutes();
      sec = now.getSeconds();
      localStorage.setItem('matchStartData', JSON.stringify({ matchId, hour, min, sec }));
    }
  } else {
    // If no data is stored, initialize and store it
    const now = new Date();
    hour = now.getHours();
    min = now.getMinutes();
    sec = now.getSeconds();
    localStorage.setItem('matchStartData', JSON.stringify({ matchId, hour, min, sec }));
  }

  const totalTime = parseInt(time) * 60; // Convert duration to seconds

  // Create a Date object using today's date and the stored start time
  const matchStartTime = new Date();
  matchStartTime.setHours(hour, min, sec, 0);

  // Function to calculate remaining time in seconds
  const calculateTimeLeft = () => {
    const now = new Date();
    const elapsed = Math.floor((now - matchStartTime) / 1000);
    const remaining = totalTime - elapsed;
    return remaining > 0 ? remaining : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (newTimeLeft <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hour, min, sec, totalTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

  const sliderWidth = (timeLeft / totalTime) * 100;

  return (
    <div className='Timer'>
      <div className='sliderBackground'>
        <div className='slider' style={{ width: `${sliderWidth}%` }}>
          <p className='time'>{formattedTime}</p>
        </div>
      </div>
    </div>
  );
}
