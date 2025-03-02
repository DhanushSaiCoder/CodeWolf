import React, { useState, useEffect } from 'react';
import "../styles/Timer.css";

export default function Timer(props) {

  const totalTime = parseInt(props.time) * 60; // 30 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(totalTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time as mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

  // Calculate slider width percentage based on remaining time
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
