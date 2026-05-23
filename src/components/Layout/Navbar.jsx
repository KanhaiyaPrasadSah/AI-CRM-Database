import React from "react";
import "./Navbar.css";

const Navbar = ({
  appMode,
  setAppMode,
  isRecognizing,
  totalCustomersCount,
  handleResetUIHistory,
}) => {
  return (
    <header className="system-navbar">
      <div className="nav-container">
        {/* LEFT */}
        <div className="brand-group">
          <div className="brand-logo-icon">Krishna Malls</div>

          <div>
            <h1 className="system-title">AI_CRM_DATABASE</h1>
            <p className="system-subtitle">
              Multi-Face Vision Overlay Pipeline
            </p>
          </div>
        </div>

        {/* CENTER */}
        <div className="mode-toggle-group">
          <button
            className={`mode-btn ${
              appMode === "recognition" ? "active-mode" : ""
            }`}
            onClick={() => {
              setAppMode("recognition");
              handleResetUIHistory();
            }}
          >
            🔍 Continuous Scanner
          </button>

          <button
            className={`mode-btn ${
              appMode === "registration" ? "active-mode" : ""
            }`}
            onClick={() => setAppMode("registration")}
          >
            👤 Register User
          </button>
        </div>

        {/* RIGHT */}
        <div className="navbar-right-panel">
          <div className="system-status-pill">
            <span
              className={`pulse-indicator ${
                isRecognizing ? "processing" : ""
              }`}
            ></span>

            {isRecognizing
              ? "Analyzing Vectors"
              : `Database Nodes: ${totalCustomersCount}`}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;