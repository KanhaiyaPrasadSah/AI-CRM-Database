import React, { useEffect, useState } from "react";
import "./CustomerProfile.css";

const CustomerProfile = ({
  activeMatch,
  activeCustomer,
  failedImages,
  getBestImageUrl,
  currentTimeStamp,
  formatTimestampWithDay,
  calculateDaysInterval,

  /* EDIT STATES */
  isEditing,
  setIsEditing,

  editNeeds,
  setEditNeeds,

  editThinking,
  setEditThinking,

  editFeedback,
  setEditFeedback,

  editGoodsPurchased,
  setEditGoodsPurchased,

  handleSaveCRMData,

  /* VOICE */
  isListening,
  startListening,
  stopListening,

  selectedLanguage,
  setSelectedLanguage,

  setVoiceTargetField,
}) => {
  const [activeField, setActiveField] =
    useState("goods_purchased");

  /* =========================================
     AUTO LOAD CUSTOMER DATA
  ========================================= */

  useEffect(() => {
    if (
      activeCustomer &&
      !isEditing
    ) {
      setEditNeeds(
        activeCustomer.their_needs || ""
      );

      setEditThinking(
        activeCustomer.thinking_to_purchase ||
          ""
      );

      setEditFeedback(
        activeCustomer.feedback || ""
      );

      setEditGoodsPurchased(
        activeCustomer.goods_purchased ||
          ""
      );
    }
  }, [activeCustomer, isEditing]);

  /* =========================================
     ENABLE EDIT MODE
  ========================================= */

  const enableEditMode = () => {
    if (!activeCustomer) return;

    setIsEditing(true);

    setEditNeeds(
      activeCustomer.their_needs || ""
    );

    setEditThinking(
      activeCustomer.thinking_to_purchase ||
        ""
    );

    setEditFeedback(
      activeCustomer.feedback || ""
    );

    setEditGoodsPurchased(
      activeCustomer.goods_purchased ||
        ""
    );
  };

  /* =========================================
     VOICE CONTROL
  ========================================= */

  const handleVoiceToggle = () => {
    if (!isEditing) {
      enableEditMode();
    }

    if (setVoiceTargetField) {
      setVoiceTargetField(
        activeField
      );
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  /* =========================================
     EMPTY STATE
  ========================================= */

  if (!activeMatch) {
    return (
      <div className="profile-card empty-state">
        <div className="placeholder-box">
          Tracking Array Empty
        </div>

        <h2>Awaiting Targets...</h2>

        <p>
          System is auto-scanning frame
          matrices continuously
        </p>
      </div>
    );
  }

  /* =========================================
     UNKNOWN USER
  ========================================= */

  if (!activeMatch.identified) {
    return (
      <div className="profile-card unknown-alert-card">
        <div className="alert-banner-header">
          ⚠️ UNKNOWN TARGET DETECTED
        </div>

        <div className="unknown-content">
          <div className="unknown-icon">
            ⚠️
          </div>

          <h3>Unknown Person</h3>

          <p>
            Matrix Similarity:
            <strong>
              {" "}
              {(
                activeMatch.confidence *
                100
              ).toFixed(1)}
              %
            </strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-card fade-in">
      {/* =========================================
          HEADER
      ========================================= */}

      <div className="profile-header">
        <div className="img-container">
          {getBestImageUrl(
            activeCustomer?.face_image_drive_link
          ) &&
          !failedImages?.[
            activeCustomer?.customer_id
          ] ? (
            <img
              src={getBestImageUrl(
                activeCustomer?.face_image_drive_link
              )}
              alt={
                activeCustomer?.customer_name
              }
              className="customer-photo"
            />
          ) : (
            <div className="placeholder-img">
              No Image
            </div>
          )}

          <span
            className={`status-badge ${(
              activeCustomer?.status ||
              "Lead"
            ).toLowerCase()}`}
          >
            {activeCustomer?.status ||
              "Lead"}
          </span>
        </div>

        <div className="header-text">
          <h3>
            {
              activeCustomer?.customer_name
            }
          </h3>

          <p>
            ID:
            <strong>
              {" "}
              {
                activeCustomer?.customer_id
              }
            </strong>
          </p>

          <p>
            Confidence:
            <strong>
              {" "}
              {Math.round(
                activeMatch.confidence *
                  100
              )}
              %
            </strong>
          </p>

          <p>
            Phone:
            <strong>
              {" "}
              {activeCustomer?.phone_no ||
                "N/A"}
            </strong>
          </p>
        </div>
      </div>

      {/* =========================================
          TIMESTAMP GRID
      ========================================= */}

      <div className="timestamp-grid">
        <div className="timestamp-box">
          <label>
            Current Timestamp
          </label>

          <span>
            {formatTimestampWithDay(
              currentTimeStamp
            )}
          </span>
        </div>

        <div className="timestamp-box">
          <label>
            Previous Visit
          </label>

          <span>
            {formatTimestampWithDay(
              activeCustomer?.timestamp_with_day ||
                activeCustomer?.last_visit_timestamp
            )}
          </span>
        </div>

        <div className="timestamp-box danger-box">
          <label>
            Days Interval
          </label>

          <span>
            {calculateDaysInterval(
              activeCustomer?.timestamp_with_day ||
                activeCustomer?.last_visit_timestamp,
              currentTimeStamp
            )}{" "}
            Days
          </span>
        </div>
      </div>

      {/* =========================================
          TOOLBAR
      ========================================= */}

      <div className="crm-toolbar">
        <select
          value={selectedLanguage}
          onChange={(e) =>
            setSelectedLanguage(
              e.target.value
            )
          }
          className="language-select"
        >
          <option value="en-US">
            English
          </option>

          <option value="hi-IN">
            Hindi
          </option>

          <option value="ne-NP">
            Nepali
          </option>
        </select>

        {!isEditing ? (
          <button
            className="save-btn"
            onClick={enableEditMode}
          >
            ✏️ Edit Profile
          </button>
        ) : (
          <>
            <button
              className={`voice-btn ${
                isListening
                  ? "voice-active"
                  : ""
              }`}
              onClick={handleVoiceToggle}
            >
              {isListening
                ? "🛑 Stop Mic"
                : "🎙️ Speak Now"}
            </button>

            <button
              className="save-btn"
              onClick={() =>
                handleSaveCRMData(
                  activeCustomer.customer_id
                )
              }
            >
              💾 Save
            </button>

            <button
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                stopListening();
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* =========================================
          GOODS PURCHASED
      ========================================= */}

      <div className="textarea-block">
        <div className="field-header">
          <label>
            Goods Purchased
          </label>

          {isEditing && (
            <button
              className={`field-mic-btn ${
                activeField ===
                "goods_purchased"
                  ? "active-field"
                  : ""
              }`}
              onClick={() => {
                setActiveField(
                  "goods_purchased"
                );

                setVoiceTargetField &&
                  setVoiceTargetField(
                    "goods_purchased"
                  );
              }}
            >
              🎯 Active
            </button>
          )}
        </div>

        <textarea
          value={editGoodsPurchased}
          onChange={(e) =>
            setEditGoodsPurchased(
              e.target.value
            )
          }
          disabled={!isEditing}
          className="crm-textarea"
          placeholder="Goods purchased..."
        />
      </div>

      {/* =========================================
          NEEDS
      ========================================= */}

      <div className="textarea-block">
        <div className="field-header">
          <label>
            Current Needs Map
          </label>

          {isEditing && (
            <button
              className={`field-mic-btn ${
                activeField ===
                "their_needs"
                  ? "active-field"
                  : ""
              }`}
              onClick={() => {
                setActiveField(
                  "their_needs"
                );

                setVoiceTargetField &&
                  setVoiceTargetField(
                    "their_needs"
                  );
              }}
            >
              🎯 Active
            </button>
          )}
        </div>

        <textarea
          value={editNeeds}
          onChange={(e) =>
            setEditNeeds(
              e.target.value
            )
          }
          disabled={!isEditing}
          className="crm-textarea"
          placeholder="Customer needs..."
        />
      </div>

      {/* =========================================
          THINKING TO PURCHASE
      ========================================= */}

      <div className="textarea-block">
        <div className="field-header">
          <label>
            Thinking to Purchase
          </label>

          {isEditing && (
            <button
              className={`field-mic-btn ${
                activeField ===
                "thinking_to_purchase"
                  ? "active-field"
                  : ""
              }`}
              onClick={() => {
                setActiveField(
                  "thinking_to_purchase"
                );

                setVoiceTargetField &&
                  setVoiceTargetField(
                    "thinking_to_purchase"
                  );
              }}
            >
              🎯 Active
            </button>
          )}
        </div>

        <textarea
          value={editThinking}
          onChange={(e) =>
            setEditThinking(
              e.target.value
            )
          }
          disabled={!isEditing}
          className="crm-textarea"
          placeholder="Future purchase interests..."
        />
      </div>

      {/* =========================================
          FEEDBACK
      ========================================= */}

      <div className="textarea-block">
        <div className="field-header">
          <label>
            Interaction Feedback
          </label>

          {isEditing && (
            <button
              className={`field-mic-btn ${
                activeField ===
                "feedback"
                  ? "active-field"
                  : ""
              }`}
              onClick={() => {
                setActiveField(
                  "feedback"
                );

                setVoiceTargetField &&
                  setVoiceTargetField(
                    "feedback"
                  );
              }}
            >
              🎯 Active
            </button>
          )}
        </div>

        <textarea
          value={editFeedback}
          onChange={(e) =>
            setEditFeedback(
              e.target.value
            )
          }
          disabled={!isEditing}
          className="crm-textarea"
          placeholder="Interaction feedback..."
        />
      </div>
    </div>
  );
};

export default CustomerProfile;