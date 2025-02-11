// MatchRequest.js
import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import "../styles/UserFriend.css";

export const MatchRequest = ({
  matchRequestData,
  rejectCountdown,
  onAccept,
  onReject,
}) => {
  const requestDivRef = useRef(null);

  return (
    <CSSTransition
      in={!!matchRequestData}
      timeout={300}
      classNames="slide"
      unmountOnExit
      nodeRef={requestDivRef}
    >
      <div ref={requestDivRef} className="requestDiv">
        <h1 className="RHeading">MATCH INVITE</h1>
        <h2>
          {matchRequestData && matchRequestData.requesterUsername}
          <span className="RRating">
            ({matchRequestData && matchRequestData.requesterRating})
          </span>
        </h2>
        <p>
          <i>invited you for a match</i>
        </p>
        <div className="RModeDetailsDiv">
          <p className="RModeDetails">
            <b>MODE:</b> {matchRequestData && matchRequestData.mode} -{" "}
            {matchRequestData && matchRequestData.programmingLanguage}
          </p>
          <p className="RModeDetails">
            <b>DIFFICULTY:</b> {matchRequestData && matchRequestData.difficulty}
          </p>
        </div>
        <div className="acceptRejectDiv">
          <button className="RAccept" onClick={onAccept}>
            Accept
          </button>
          <button className="RReject" onClick={onReject}>
            Reject ({rejectCountdown})
          </button>
        </div>
      </div>
    </CSSTransition>
  );
};
