// MatchRequest.js
import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import "../styles/MatchRequest.css";

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
      <div ref={requestDivRef} className="match-request-card">
        <header className="mr-header">
          <h1>Match Invite</h1>
        </header>
        <section className="mr-body">
          <h2 className="mr-username">
            {matchRequestData && matchRequestData.requesterUsername}
            <span className="mr-rating">
              ({matchRequestData && matchRequestData.requesterRating})
            </span>
          </h2>
          <p className="mr-invite-text">
            <em>invited you for a match</em>
          </p>
          <div className="mr-details">
            <p>
              <strong>Mode:</strong> {matchRequestData && matchRequestData.mode} -{" "}
              {matchRequestData && matchRequestData.programmingLanguage}
            </p>
            <p>
              <strong>Difficulty:</strong> {matchRequestData && matchRequestData.difficulty}
            </p>
          </div>
        </section>
        <footer className="mr-actions">
          <button className="mr-btn reject-btn" onClick={onReject}>
            Reject ({rejectCountdown})
          </button>
          <button className="mr-btn accept-btn" onClick={onAccept}>
            Accept
          </button>

        </footer>
      </div>
    </CSSTransition>
  );
};
