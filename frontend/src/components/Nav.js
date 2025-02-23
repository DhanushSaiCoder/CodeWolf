// Nav.js
import React from 'react';
import "../styles/Nav.css";
import NavButton from './NavButton';
import { MatchRequest } from '../components/MatchRequest';

const Nav = (props) => {
  const { currPage, matchRequestData, rejectCountdown, onAccept, onReject } = props;

  return (
    <div className="Nav">
      <NavButton pos="first" to="home" currPage={currPage}/>
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
