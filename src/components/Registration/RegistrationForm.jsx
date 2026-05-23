import React from "react";
import "./RegistrationForm.css";

const RegistrationForm = ({
  regId,
  setRegId,
  regName,
  setRegName,
  regPhone,
  setRegPhone,
  regStatus,
  setRegStatus,
  capturedBase64,
  handleRegisterCustomer,
  isRegistering,
}) => {
  return (
    <div className="registration-card fade-in">
      <div className="registration-header-block">
        <h2>Register Face Vector Data Node</h2>

        <p className="sub-text">
          Map physical features to standard database profile
          definitions
        </p>
      </div>

      <form
        onSubmit={handleRegisterCustomer}
        className="registration-system-form"
      >
        {/* ROW */}
        <div className="form-row-split">
          <div className="input-group-layout">
            <label>Target Identifier ID *</label>

            <input
              type="text"
              required
              value={regId}
              onChange={(e) => setRegId(e.target.value)}
              className="crm-input"
              placeholder="e.g. KM-2026-89"
            />
          </div>

          <div className="input-group-layout">
            <label>Full Structural Name *</label>

            <input
              type="text"
              required
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className="crm-input"
              placeholder="e.g. Rahul Sharma"
            />
          </div>
        </div>

        {/* PHONE */}
        <div className="input-group-layout">
          <label>Active Contact Number</label>

          <input
            type="text"
            value={regPhone}
            onChange={(e) => setRegPhone(e.target.value)}
            className="crm-input"
            placeholder="e.g. +91 9876543210"
          />
        </div>

        {/* STATUS */}
        <div className="input-group-layout">
          <label>CRM Funnel Status</label>

          <select
            value={regStatus}
            onChange={(e) => setRegStatus(e.target.value)}
            className="crm-input"
          >
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="VIP">VIP</option>
          </select>
        </div>

        {/* SNAPSHOT */}
        <div className="snapshot-preview-block">
          <label>Linked Vector Photo Mapping Preview</label>

          {capturedBase64 ? (
            <div className="preview-frame animate-pop">
              <img
                src={capturedBase64}
                alt="Captured Profile"
              />

              <span className="success-check-bubble">
                ✓ Image Ready
              </span>
            </div>
          ) : (
            <div className="preview-frame empty-frame">
              <p>
                No profile image attached. Use the snapshot
                tool on the left camera window.
              </p>
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="save-btn register-submit-btn"
          disabled={isRegistering || !capturedBase64}
        >
          {isRegistering
            ? "Registering Node Data..."
            : "💾 Save New Customer to CRM"}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;