import React from "react";
import "./DetectionLedger.css";

const DetectionLedger = ({
  identifiedMatches,
  selectedMatchIndex,
  setSelectedMatchIndex,
  handleResetUIHistory,
}) => {
  return (
    <div className="camera-downside-ledger">
      <div className="ledger-header">
        <h4>
          Detected Track Arrays ({identifiedMatches.length})
        </h4>

        <button
          className="reset-ui-btn"
          onClick={handleResetUIHistory}
        >
          Reset UI & History
        </button>
      </div>

      {identifiedMatches.length === 0 ? (
        <p className="empty-ledger-text">
          No face coordinates present in active camera window.
        </p>
      ) : (
        <div className="ledger-scroll-container">
          {identifiedMatches.map((match, idx) => {
            const name =
              match.identified && match.customer
                ? match.customer.customer_name
                : "Unknown Target";

            const idNum =
              match.identified && match.customer
                ? match.customer.customer_id
                : "N/A";

            return (
              <div
                key={idx}
                className={`ledger-item-row ${
                  selectedMatchIndex === idx
                    ? "selected-row-active"
                    : ""
                }`}
                onClick={() => setSelectedMatchIndex(idx)}
              >
                <div className="row-avatar">
                  {match.identified ? "👤" : "⚠️"}
                </div>

                <div className="row-details">
                  <span className="row-name">{name}</span>

                  <span className="row-sub">
                    ID: {idNum} • Confidence:{" "}
                    {Math.round(match.confidence * 100)}%
                  </span>
                </div>

                {selectedMatchIndex === idx && (
                  <span className="active-view-tag">
                    VIEWING
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DetectionLedger;