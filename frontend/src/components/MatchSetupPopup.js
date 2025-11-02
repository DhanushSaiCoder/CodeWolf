import React from 'react';
import '../styles/MatchSetupPopup.css';

const MatchSetupPopup = ({ show, onClose, onSubmit, matchSettings, onChange }) => {
  if (!show) {
    return null;
  }

  return (
    <div onClick={onClose} className="RPopupDivContainer">
      <div onClick={(e) => e.stopPropagation()} className="RPopupDiv">
        <div className="popupHeader">
          Set Match
          <button type="button" onClick={onClose} className="closeButton">
            &times;
          </button>
        </div>
        <div className="popupContent">
          <form onSubmit={onSubmit}>
            <div className="formGroup">
              <label htmlFor="programmingLanguage">Programming Language:</label>
              <select
                id="programmingLanguage"
                name="programmingLanguage"
                value={matchSettings.programmingLanguage}
                onChange={onChange}
                required
              >
                <option value="js">JavaScript</option>
                <option value="py">Python</option>
              </select>
            </div>
            <div className="formGroup">
              <label htmlFor="difficulty">Difficulty:</label>
              <select
                id="difficulty"
                name="difficulty"
                value={matchSettings.difficulty}
                onChange={onChange}
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="formGroup">
              <label htmlFor="mode">Mode:</label>
              <select
                id="mode"
                name="mode"
                value={matchSettings.mode}
                onChange={onChange}
                required
              >
                <option value="quick-debug">QUICK DEBUG MODE</option>
              </select>
            </div>
            <button type="submit">SEND MATCH REQUEST</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MatchSetupPopup;
