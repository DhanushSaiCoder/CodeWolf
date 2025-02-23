// Nav.js
import React from 'react';
import "../styles/Nav.css";
import NavButton from './NavButton';
import { MatchRequest } from '../components/MatchRequest';

const Nav = (props) => {
  const { currPage, matchRequestData, rejectCountdown, onAccept, onReject } = props;

  return (
    <div className="Nav">
      <NavButton pos="first" to="home" currPage={currPage}

        unactiveIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 256 256"
            fill="#d5bcf5"
          >
            <g fillRule="nonzero" stroke="none" strokeWidth="1">
              <g transform="scale(5.33333,5.33333)">
                <path d="M23.95117,4c-0.31984,0.01092 -0.62781,0.12384 -0.87891,0.32227l-14.21289,11.19727c-1.8039,1.42163 -2.85937,3.59398 -2.85937,5.89063v19.08984c0,1.36359 1.13641,2.5 2.5,2.5h10c1.36359,0 2.5,-1.13641 2.5,-2.5v-10c0,-0.29504 0.20496,-0.5 0.5,-0.5h5c0.29504,0 0.5,0.20496 0.5,0.5v10c0,1.36359 1.13641,2.5 2.5,2.5h10c1.36359,0 2.5,-1.13641 2.5,-2.5v-19.08984c0,-2.29665 -1.05548,-4.46899 -2.85937,-5.89062l-14.21289,-11.19727c-0.27738,-0.21912 -0.62324,-0.33326 -0.97656,-0.32227zM24,7.41016l13.28516,10.4668c1.0841,0.85437 1.71484,2.15385 1.71484,3.5332v18.58984h-9v-9.5c0,-1.91495 -1.58505,-3.5 -3.5,-3.5h-5c-1.91495,0 -3.5,1.58505 -3.5,3.5v9.5h-9v-18.58984c0,-1.37935 0.63074,-2.67883 1.71484,-3.5332z"></path>
              </g>
            </g>
          </svg>
        }

        activeIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 256 256"
            fill="#0d0218"
          >
            <g fillRule="nonzero" stroke="none" strokeWidth="1">
              <g transform="scale(5.33333,5.33333)">
                <path d="M39.5,43h-9c-1.381,0 -2.5,-1.119 -2.5,-2.5v-9c0,-1.105 -0.895,-2 -2,-2h-4c-1.105,0 -2,0.895 -2,2v9c0,1.381 -1.119,2.5 -2.5,2.5h-9c-1.381,0 -2.5,-1.119 -2.5,-2.5v-19.087c0,-2.299 1.054,-4.471 2.859,-5.893l14.212,-11.199c0.545,-0.428 1.313,-0.428 1.857,0l14.214,11.199c1.805,1.422 2.858,3.593 2.858,5.891v19.089c0,1.381 -1.119,2.5 -2.5,2.5z"></path>
              </g>
            </g>
          </svg>
        }

      />
      <NavButton to="friends" currPage={currPage} />
      <NavButton to="history" currPage={currPage} />
      <NavButton to="leaderboard" currPage={currPage} />
      <NavButton pos="last" to="settings" currPage={currPage} />

      {/* Render the MatchRequest component */}
      <MatchRequest
        matchRequestData={matchRequestData}
        rejectCountdown={rejectCountdown}
        onAccept={onAccept}
        onReject={onReject}
      />
    </div>
  );
};

export default Nav;
