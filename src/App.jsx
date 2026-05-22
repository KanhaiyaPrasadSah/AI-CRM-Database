import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_BASE_URL = "https://krishnamills-backend-api.hf.space";

/* HIGH-SPEED RELIABLE GOOGLE DRIVE IMAGE STREAM LAYER */
const getBestImageUrl = (url) => {
  if (!url) return "";
  try {
    const cleanUrl = url.toString().trim();
    if (cleanUrl.startsWith("data:image")) return cleanUrl;
    if (cleanUrl.includes("drive.google.com")) {
      let fileId = "";
      if (cleanUrl.includes("/file/d/")) {
        fileId = cleanUrl.split("/file/d/")[1].split("/")[0];
      } else if (cleanUrl.includes("id=")) {
        fileId = cleanUrl.split("id=")[1].split("&")[0];
      }
      
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    }
    return cleanUrl;
  } catch (err) {
    console.error("Image parsing engine fault:", err);
    return url;
  }
};

function App() {
  const [appMode, setAppMode] = useState("recognition");
  const [identifiedMatches, setIdentifiedMatches] = useState([]);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const [faceBoxes, setFaceBoxes] = useState([]);

  // Stream Selectors
  const [streamSourceType, setStreamSourceType] = useState("webcam"); 
  const [networkStreamUrl, setNetworkStreamUrl] = useState("");

  // Registration Form Context Matrix
  const [regId, setRegId] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regStatus, setRegStatus] = useState("Lead");
  const [isRegistering, setIsRegistering] = useState(false);
  const [capturedBase64, setCapturedBase64] = useState("");

  // CRM Fields Mutation Hooks
  const [isEditingId, setIsEditingId] = useState(null);
  const [editNeeds, setEditNeeds] = useState("");
  const [editThinking, setEditThinking] = useState("");
  const [editFeedback, setEditFeedback] = useState(""); 
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);

  // Hardware Ref Targets
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const lastLoggedTimeRef = useRef({});

  useEffect(() => {
    if (streamSourceType === "webcam") {
      startCamera();
    } else {
      stopCamera();
      setCameraActive(true); 
    }
    fetchSystemStats();
    return () => stopCamera();
  }, [appMode, streamSourceType]);

  // CONTINUOUS MONITORING FACE RECOGNITION LOOP ENGINE
  useEffect(() => {
    if (appMode !== "recognition" || isRecognizing) return;

    const interval = setInterval(() => {
      autoScanFaceMap();
    }, 1200); 

    return () => clearInterval(interval);
  }, [appMode, streamSourceType, networkStreamUrl, isRecognizing, cameraActive]);

  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Webcam hardware fault log:", err);
      setCameraError(`Camera connection error: ${err.message || "Check permissions."}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (streamSourceType === "webcam") {
      setCameraActive(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setTotalCustomersCount(stats.total_customers || 0);
      }
    } catch (err) {
      console.error("Error querying backend system metrics:", err);
    }
  };

  const handleResetUIHistory = () => {
    setIdentifiedMatches([]);
    setFaceBoxes([]);
    setSelectedMatchIndex(0);
    setFailedImages({});
    lastLoggedTimeRef.current = {};
    setStatusMessage("System UI & Tracking Ledger Reset Successfully 🧹");
  };

  const autoScanFaceMap = async () => {
    if (isRecognizing) return;
    try {
      if (streamSourceType === "webcam") {
        if (!videoRef.current || videoRef.current.readyState !== 4) return;
        setIsRecognizing(true);

        const videoWidth = videoRef.current.videoWidth || 640;
        const videoHeight = videoRef.current.videoHeight || 480;

        const canvas = document.createElement("canvas");
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL("image/jpeg", 0.85);
        const response = await fetch(`${API_BASE_URL}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image }),
        });
        if (!response.ok) throw new Error(`Server Status: ${response.status}`);
        const data = await response.json();
        processServerMatches(data, videoWidth, videoHeight);
      } 
      else {
        if (!networkStreamUrl) return;
        setIsRecognizing(true);
        const response = await fetch(`${API_BASE_URL}/verify_url_stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stream_url: networkStreamUrl }),
        });
        if (!response.ok) throw new Error(`Network Stream Server Error: ${response.status}`);
        const data = await response.json();
        processServerMatches(data, 640, 480);
      }
    } catch (error) {
      console.error("AI Face Matrix Pipeline Loop Error:", error);
    } finally {
      setIsRecognizing(false);
    }
  };

  const processServerMatches = (data, sourceWidth, sourceHeight) => {
    if (data.matches && data.matches.length > 0) {
      const trackingBoxes = data.matches.map(match => {
        const box = match.box || { x: 150, y: 120, w: 300, h: 300 };
        return {
          x: (box.x / sourceWidth) * 100,
          y: (box.y / sourceHeight) * 100,
          w: (box.w / sourceWidth) * 100,
          h: (box.h / sourceHeight) * 100,
          name: match.identified && match.customer ? (match.customer.customer_name || match.customer["customer_name"]) : "Unknown Target",
          identified: match.identified
        };
      });
      setFaceBoxes(trackingBoxes);
      setIdentifiedMatches(data.matches);

      if (selectedMatchIndex >= data.matches.length) {
        setSelectedMatchIndex(0);
      }

      const now = Date.now();
      data.matches.forEach(match => {
        if (match.identified && match.customer) {
          const cust = match.customer;
          const cId = cust.customer_id || cust["customer_id"];
          const cName = cust.customer_name || cust["customer_name"];
          const lastLogged = lastLoggedTimeRef.current[cId] || 0;

          if (now - lastLogged > 180000) { 
            lastLoggedTimeRef.current[cId] = now;
            logCustomerVisit(cId, cName);
          }
        }
      });
      const recognizedCount = data.matches.filter(m => m.identified).length;
      const unknownCount = data.matches.length - recognizedCount;
      setStatusMessage(`Active Grid: Identified (${recognizedCount}) • Unknown Alerts (${unknownCount}) 🛡️`);
    } else {
      setFaceBoxes([]);
      setIdentifiedMatches([]);
    }
    
    if (data.total_customers) setTotalCustomersCount(data.total_customers);
  };

  const logCustomerVisit = async (id, name) => {
    try {
      await fetch(`${API_BASE_URL}/log_visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(id), name: String(name) }),
      });
      fetchSystemStats();
    } catch (err) {
      console.error("Backend visit logging pipeline exception:", err);
    }
  };

  const captureSnapshotForRegistration = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");

    if (streamSourceType === "webcam" && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setCapturedBase64(canvas.toDataURL("image/jpeg", 0.90));
      setStatusMessage("Webcam Snapshot mapped for registration profile! 📸");
    } else {
      const streamImg = document.getElementById("networkStreamElement");
      if (streamImg) {
        try {
          ctx.drawImage(streamImg, 0, 0, canvas.width, canvas.height);
          setCapturedBase64(canvas.toDataURL("image/jpeg", 0.90));
          setStatusMessage("Stream Snapshot captured securely! 📸");
        } catch (e) {
          setStatusMessage("CORS Restriction: Use Webcam mode to capture new snapshots ⚠️");
        }
      }
    }
  };

  /* HANDLER RECONFIGURED TO INTERCEPT CORES WITH ENHANCED ACKNOWLEDGEMENT FEEDBACK BACKWARDS COMPATIBILITY */
  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    if (!capturedBase64) {
      setStatusMessage("Error: Capture a photo framework vector before registration ❌");
      return;
    }

    try {
      setIsRegistering(true);
      setStatusMessage("Syncing face vectors into master matrix rows...");
      const payload = {
        id: String(regId).trim(),
        name: String(regName).trim(),
        status: String(regStatus),
        phone: String(regPhone).trim(),
        image: capturedBase64
      };

      const response = await fetch(`${API_BASE_URL}/register_customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server connection fault. Core status code: ${response.status}`);
      }

      const responseData = await response.json();

      // Explicit verification check validating incoming response headers against v5.0 acknowledgement layer
      if (responseData.error || responseData.success === false) {
        throw new Error(responseData.message || responseData.error || "Hugging Face layer rejected transaction.");
      }

      // Check for strict acknowledgement flags returned by the upgraded main.py model
      if (responseData.acknowledged || responseData.status === "success") {
        const metadata = responseData.data || {};
        setStatusMessage(
          `🎉 Profile Registered Successfully! ID: ${metadata.customer_id || regId} | Dim: [${metadata.vector_dimensions || 512}] • Metrics Initialized!`
        );
      } else {
        setStatusMessage("Profile written to engine, but acknowledgment flag was unallocated ⚠️");
      }

      // Reset Registration Fields On Success
      setRegId("");
      setRegName("");
      setRegPhone("");
      setCapturedBase64("");
      fetchSystemStats();
    } catch (error) {
      console.error("Registration engine trace exception:", error);
      setStatusMessage(`Registration failed: ${error.message} ❌`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSaveCRMData = async (customerId) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/update_customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: String(customerId),
          their_needs: editNeeds.trim(),
          thinking_to_purchase: editThinking.trim(),
          feedback: editFeedback.trim() 
        }),
      });
      if (!response.ok) throw new Error(`CRM Mutation Endpoint Error: ${response.status}`);
      setStatusMessage("Records synchronized successfully ✅");
      setIdentifiedMatches(prev => prev.map(match => {
        const c = match.customer;
        if (c && (c.customer_id || c["customer_id"]) === customerId) {
          return {
            ...match,
            customer: { 
              ...c, 
              their_needs: editNeeds.trim(), 
              thinking_to_purchase: editThinking.trim(),
              feedback: editFeedback.trim()
            }
          };
        }
        return match;
      }));
      setIsEditingId(null);
    } catch (error) {
      setStatusMessage(`Failed to save: ${error.message} ❌`);
    } finally {
      setSaving(false);
    }
  };

  const activeMatch = identifiedMatches[selectedMatchIndex];
  const activeCustomer = activeMatch?.identified ? activeMatch.customer : null;

  return (
    <div className="app-workspace">
      <header className="system-navbar">
        <div className="nav-container">
          <div className="brand-group">
            <div className="brand-logo-icon">Krishna Malls</div>
            <div>
              <h1 className="system-title">AI_CRM_DATABASE</h1>
              <p className="system-subtitle">Multi-Face Vision Overlay Pipeline</p>
            </div>
          </div>
          
          <div className="mode-toggle-group">
            <button className={`mode-btn ${appMode === "recognition" ? "active-mode" : ""}`} onClick={() => { setAppMode("recognition"); handleResetUIHistory(); }}>
              🔍 Continuous Scanner
            </button>
            <button className={`mode-btn ${appMode === "registration" ? "active-mode" : ""}`} onClick={() => setAppMode("registration")}>
              👤 Register User
            </button>
          </div>

          <div className="system-status-pill">
            <span className={`pulse-indicator ${isRecognizing ? "processing" : ""}`}></span>
            {isRecognizing ? "Analyzing Vectors" : `Database Nodes: ${totalCustomersCount}`}
          </div>
        </div>
      </header>

      <main className="workspace-body">
        <div className="crm-container">
          
          <div className="video-section">
            <div className="video-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 className="section-title" style={{ margin: 0 }}>
                {appMode === "recognition" ? "Live Intelligent Eye Feed" : "Registration Feed"}
              </h3>
              
              <select 
                className="crm-input" 
                style={{ width: "auto", padding: "5px 10px", fontSize: "0.85rem" }}
                value={streamSourceType}
                onChange={(e) => setStreamSourceType(e.target.value)}
              >
                <option value="webcam">System Local Webcam</option>
                <option value="ip_cam">IP Camera Stream URL</option>
                <option value="cctv">CCTV Live Feed Address</option>
              </select>
            </div>

            {streamSourceType !== "webcam" && (
              <div className="input-block" style={{ marginBottom: "12px" }}>
                <input 
                  type="text"
                  placeholder="Enter video stream path (e.g. http://192.168.1.50:8080/video)"
                  value={networkStreamUrl}
                  onChange={(e) => setNetworkStreamUrl(e.target.value)}
                  className="crm-input"
                  style={{ border: "1px solid #4f46e5" }}
                />
              </div>
            )}

            <div className="camera-box" style={{ position: "relative" }}>
              {cameraError && streamSourceType === "webcam" ? (
                <div className="camera-error-msg">{cameraError}</div>
              ) : streamSourceType === "webcam" ? (
                <video ref={videoRef} autoPlay playsInline muted className="live-video" />
              ) : (
                <img 
                  id="networkStreamElement"
                  src={networkStreamUrl || "https://placehold.co/640x480?text=Awaiting+Valid+Network+Stream+Connection+URL"} 
                  alt="Live Network Target Stream Pipeline" 
                  className="live-video"
                  crossOrigin="anonymous"
                  onError={() => console.log("Stream canvas frame dropped")}
                />
              )}
              
              {appMode === "recognition" && faceBoxes.map((box, idx) => (
                <div 
                  key={idx}
                  className={`spatial-bounding-box ${box.identified ? "identified-edge" : "unknown-edge"}`}
                  style={{
                    position: "absolute",
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.w}%`,
                    height: `${box.h}%`,
                    border: box.identified ? "3px solid #4caf50" : "3px dashed #f44336",
                    boxShadow: "0 0 12px rgba(0,0,0,0.5)",
                    pointerEvents: "none",
                    zIndex: 10
                  }}
                >
                  <span className="bounding-box-label" style={{
                    position: "absolute",
                    top: "-25px",
                    left: "-3px",
                    background: box.identified ? "#4caf50" : "#f44336",
                    color: "white",
                    padding: "2px 8px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    borderRadius: "3px 3px 0 0"
                  }}>
                    {box.name}
                  </span>
                </div>
              ))}
            </div>
            
            {appMode === "recognition" && (
              <div className="camera-downside-ledger">
                <div className="ledger-header">
                  <h4>Detected Track Arrays ({identifiedMatches.length})</h4>
                  <button className="reset-ui-btn" onClick={handleResetUIHistory}>
                    Reset UI & History
                  </button>
                </div>

                {identifiedMatches.length === 0 ? (
                  <p className="empty-ledger-text">No face coordinates present in active camera window.</p>
                ) : (
                  <div className="ledger-scroll-container">
                    {identifiedMatches.map((match, idx) => {
                      const name = match.identified && match.customer ? (match.customer.customer_name || match.customer["customer_name"]) : "Unknown Target";
                      const idNum = match.identified && match.customer ? (match.customer.customer_id || match.customer["customer_id"]) : "N/A";
                      return (
                        <div 
                          key={idx} 
                          className={`ledger-item-row ${selectedMatchIndex === idx ? "selected-row-active" : ""} ${match.identified ? "status-matched" : "status-unknown"}`}
                          onClick={() => setSelectedMatchIndex(idx)}
                        >
                          <div className="row-avatar">
                            {match.identified ? "👤" : "⚠️"}
                          </div>
                          <div className="row-details">
                            <span className="row-name">{name}</span>
                            <span className="row-sub">ID: {idNum} • Confidence: {Math.round(match.confidence * 100)}%</span>
                          </div>
                          {selectedMatchIndex === idx && <span className="active-view-tag">VIEWING</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {appMode === "registration" && (
              <button className="btn-scan capture-snapshot" onClick={captureSnapshotForRegistration} disabled={!cameraActive}>
                📸 Snap Registration Image
              </button>
            )}

            {statusMessage && <p className="crm-status-toast">{statusMessage}</p>}
          </div>

          <div className="profile-section">
            {appMode === "recognition" ? (
              !activeMatch ? (
                <div className="profile-card empty-state">
                  <div className="img-container placeholder-state">
                    <div className="placeholder-box">Tracking Array Empty</div>
                  </div>
                  <div className="header-text">
                    <h2>Awaiting Targets...</h2>
                    <p className="sub-text">System is auto-scanning frame matrices for faces continuously</p>
                  </div>
                </div>
              ) : !activeMatch.identified ? (
                <div className="profile-card unknown-alert-card animate-pop">
                  <div className="alert-banner-header">⚠️ UNKNOWN TARGET DETECTED</div>
                  <div className="profile-header" style={{paddingTop: "15px"}}>
                    <div className="img-container">
                      <div className="placeholder-box alert-box">
                        <span className="no-img-alert" style={{color: "#f44336"}}>SECURITY WARNING</span>
                      </div>
                      <span className="status-badge unknown-badge">UNREGISTERED</span>
                    </div>
                    <div className="header-text">
                      <h3>Unknown Person</h3>
                      <p className="sub-text">Vector Map Match: <strong style={{color: '#f44336'}}>Unregistered Blocked</strong></p>
                      <p className="sub-text">Matrix Similarity: <strong>{(activeMatch.confidence * 100).toFixed(1)}%</strong></p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-card fade-in">
                  <div className="profile-header">
                    <div className="img-container">
                      {getBestImageUrl(activeCustomer.face_image_drive_link || activeCustomer["face_image_drive_link"]) && !failedImages[activeCustomer.customer_id || activeCustomer["customer_id"]] ? (
                        <img
                          src={getBestImageUrl(activeCustomer.face_image_drive_link || activeCustomer["face_image_drive_link"])}
                          alt={activeCustomer.customer_name || activeCustomer["customer_name"]}
                          className="customer-photo"
                          onError={() => {
                            const cId = activeCustomer.customer_id || activeCustomer["customer_id"];
                            setFailedImages(prev => ({ ...prev, [cId]: true }));
                          }}
                        />
                      ) : (
                        <div className="placeholder-box fallback-link-container">
                          {(activeCustomer.face_image_drive_link || activeCustomer["face_image_drive_link"]) ? (
                            <a href={activeCustomer.face_image_drive_link || activeCustomer["face_image_drive_link"]} target="_blank" rel="noopener noreferrer" className="drive-fallback-link">
                              📁 Open Photo Link
                            </a>
                          ) : (
                            <span className="no-img-alert">🔒 No Asset Found</span>
                          )}
                        </div>
                      )}
                      <span className={`status-badge ${(activeCustomer.status || activeCustomer["status"] || "Lead").toLowerCase()}`}>
                        {activeCustomer.status || activeCustomer["status"] || "Lead"}
                      </span>
                    </div>

                    <div className="header-text">
                      <h3>{activeCustomer.customer_name || activeCustomer["customer_name"]}</h3>
                      <p className="sub-text">ID: <strong>{activeCustomer.customer_id || activeCustomer["customer_id"]}</strong></p>
                      <p className="sub-text">Confidence: <strong style={{color: '#4caf50'}}>{Math.round(activeMatch.confidence * 100)}%</strong></p>
                      <p className="sub-text">Phone: <strong>{activeCustomer.phone_no || activeCustomer["phone_no"] || "N/A"}</strong></p>
                    </div>
                  </div>

                  <div className="info-grid">
                    <div className="info-item">
                      <label>Total Visits</label>
                      <span className="highlight-blue">
                        {activeCustomer.total_visit_per_day || activeCustomer["total_visit_per_day"] || "1"}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Days Interval</label>
                      <span>{activeCustomer.days_interval_visit || activeCustomer["days_interval_visit"] || "0"} Days</span>
                    </div>
                    <div className="info-item">
                      <label>Transaction Limit</label>
                      <span className="text-success">${activeCustomer.transaction_limit || activeCustomer["transaction_limit"] || "0"}</span>
                    </div>
                  </div>

                  <div className="purchased-section">
                    <label>Goods Previously Purchased</label>
                    <div className="goods-box">
                      {activeCustomer.goods_purchased || activeCustomer["goods_purchased"] || "No prior transactional data recorded"}
                    </div>
                  </div>

                  <hr className="divider" />
               
                  <div className="insights-section">
                    <div className="insights-header">
                      <h4>Intent Matrix Profile Data</h4>
                      {isEditingId !== (activeCustomer.customer_id || activeCustomer["customer_id"]) ? (
                        <button className="btn-edit" onClick={() => {
                          const cId = activeCustomer.customer_id || activeCustomer["customer_id"];
                          setIsEditingId(cId);
                          setEditNeeds(activeCustomer.their_needs || activeCustomer["their_needs"] || "");
                          setEditThinking(activeCustomer.thinking_to_purchase || activeCustomer["thinking_to_purchase"] || "");
                          setEditFeedback(activeCustomer.feedback || activeCustomer["feedback"] || ""); 
                        }}>✏️ Edit Fields</button>
                      ) : (
                        <button className="btn-cancel" onClick={() => setIsEditingId(null)}>Cancel</button>
                      )}
                    </div>

                    <div className="input-block">
                      <label>Customer Core Needs</label>
                      <textarea
                        value={isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"]) ? editNeeds : (activeCustomer.their_needs || activeCustomer["their_needs"] || "")}
                        onChange={(e) => setEditNeeds(e.target.value)}
                        disabled={isEditingId !== (activeCustomer.customer_id || activeCustomer["customer_id"])}
                        className="crm-textarea"
                      />
                    </div>

                    <div className="input-block">
                      <label>Thinking to Purchase</label>
                      <input
                        type="text"
                        value={isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"]) ? editThinking : (activeCustomer.thinking_to_purchase || activeCustomer["thinking_to_purchase"] || "")}
                        onChange={(e) => setEditThinking(e.target.value)}
                        disabled={isEditingId !== (activeCustomer.customer_id || activeCustomer["customer_id"])}
                        className="crm-input"
                      />
                    </div>

                    <div className="input-block">
                      <label>Personal Review / Feedback</label>
                      <textarea
                        value={isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"]) ? editFeedback : (activeCustomer.feedback || activeCustomer["feedback"] || "")}
                        onChange={(e) => setEditFeedback(e.target.value)}
                        disabled={isEditingId !== (activeCustomer.customer_id || activeCustomer["customer_id"])}
                        placeholder="Log personalized interaction summaries, review remarks, or audit notes..."
                        className="crm-textarea"
                        style={{ borderLeft: "3px solid #4f46e5" }}
                      />
                    </div>

                    {isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"]) && (
                      <button className="save-btn" onClick={() => handleSaveCRMData(activeCustomer.customer_id || activeCustomer["customer_id"])} disabled={saving}>
                        {saving ? "Syncing Layers..." : "Commit Data Sync"}
                      </button>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="registration-card fade-in">
                <h3 className="form-heading">Create New Vector Profile</h3>
                <p className="form-subtext">Input database field mappings and attach face weights.</p>
                
                <form onSubmit={handleRegisterCustomer} className="registration-form">
                  <div className="form-split">
                    <div className="input-block">
                      <label>Customer ID (customer_id) *</label>
                      <input type="text" required value={regId} onChange={(e) => setRegId(e.target.value)} placeholder="e.g. CUST-9021" className="crm-input" />
                    </div>
                    <div className="input-block">
                      <label>Customer Name *</label>
                      <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Full Name" className="crm-input" />
                    </div>
                  </div>

                  <div className="input-block">
                    <label>Phone Number (phone_no)</label>
                    <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="Contact Details" className="crm-input" />
                  </div>

                  <div className="input-block">
                    <label>Status Classification</label>
                    <select value={regStatus} onChange={(e) => setRegStatus(e.target.value)} className="crm-input selection-box">
                      <option value="Lead">Lead</option>
                      <option value="Active">Active</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>

                  <div className="snapshot-preview-block">
                    <label>Linked Vector Photo Mapping Preview</label>
                    {capturedBase64 ? (
                      <div className="preview-frame animate-pop">
                        <img src={capturedBase64} alt="Captured Profile Map" />
                        <span className="success-check-bubble">✓ Image Ready</span>
                      </div>
                    ) : (
                      <div className="preview-frame empty-frame">
                        <p>No profile image attached. Use the snapshot tool on the left camera window.</p>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="save-btn register-submit-btn" disabled={isRegistering || !capturedBase64}>
                    {isRegistering ? "Registering Node Data..." : "💾 Save New Customer to CRM"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="system-footer">
        <p>© 2026 Krishna Mills CRM Suite • Built-In Vision Intelligence Pipeline</p>
      </footer>
    </div>
  );
}

export default App;