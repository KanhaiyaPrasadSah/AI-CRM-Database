import React from "react";
import "./CameraFeed.css";

const CameraFeed = ({
  videoRef,
  cameraError,

  /* CAMERA SOURCE */
  streamSourceType,
  setStreamSourceType,

  /* NETWORK URL */
  networkStreamUrl,
  setNetworkStreamUrl,

  /* DETECTION */
  faceBoxes,

  /* APP MODE */
  appMode,

  /* SNAPSHOT */
  captureSnapshotForRegistration,
  cameraActive,
}) => {
  return (
    <div className="video-section">
      {/* HEADER */}
      <div className="video-section-header">
        <h3 className="section-title">
          {appMode === "recognition"
            ? "Live Intelligent Eye Feed"
            : "Registration Feed"}
        </h3>

        {/* CAMERA SELECTOR */}
        <select
          className="camera-source-select"
          value={streamSourceType}
          onChange={(e) =>
            setStreamSourceType(
              e.target.value
            )
          }
        >
          <option value="webcam">
            Internal Webcam
          </option>

          <option value="ip_cam">
            IP Webcam
          </option>

          <option value="cctv">
            CCTV Camera
          </option>
        </select>
      </div>

      {/* NETWORK INPUT */}
      {streamSourceType !==
        "webcam" && (
        <div className="stream-url-box">
          <input
            type="text"
            className="stream-url-input"
            placeholder="Enter CCTV / IP Camera Stream URL"
            value={networkStreamUrl}
            onChange={(e) =>
              setNetworkStreamUrl(
                e.target.value
              )
            }
          />
        </div>
      )}

      {/* CAMERA AREA */}
      <div className="camera-box">
        {cameraError &&
        streamSourceType ===
          "webcam" ? (
          <div className="camera-error-msg">
            {cameraError}
          </div>
        ) : streamSourceType ===
          "webcam" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="live-video"
          />
        ) : (
          <img
            id="networkStreamElement"
            src={
              networkStreamUrl ||
              "https://placehold.co/640x480?text=Awaiting+Valid+Network+Stream+Connection+URL"
            }
            alt="Network Stream"
            className="live-video"
            crossOrigin="anonymous"
          />
        )}

        {/* FACE BOXES */}
        {appMode ===
          "recognition" &&
          faceBoxes.map(
            (box, idx) => (
              <div
                key={idx}
                className={`spatial-bounding-box ${
                  box.identified
                    ? "identified-edge"
                    : "unknown-edge"
                }`}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                }}
              >
                <span className="bounding-box-label">
                  {box.name}
                </span>
              </div>
            )
          )}
      </div>

      {/* SNAPSHOT */}
      {appMode ===
        "registration" && (
        <button
          className="capture-btn"
          onClick={
            captureSnapshotForRegistration
          }
          disabled={!cameraActive}
        >
          📸 Snap Registration Image
        </button>
      )}
    </div>
  );
};

export default CameraFeed;