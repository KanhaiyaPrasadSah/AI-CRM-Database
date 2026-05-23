import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Updated Web App Backend Space Endpoint Matrix
const API_BASE_URL = "https://krishnamills-backend-api.hf.space";

/* HIGH-SPEED RELIABLE GOOGLE DRIVE IMAGE STREAM LAYER */
const getBestImageUrl = (url) => {
  if (!url) return "";
  try {
    const cleanUrl = String(url).trim();
    
    // base64 image (works always)
    if (cleanUrl.startsWith("data:image")) return cleanUrl;

    // Google Drive file handling
    if (cleanUrl.includes("drive.google.com")) {
      let fileId = null;

      // /file/d/ format
      const match1 = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match1) fileId = match1[1];

      // ?id= format
      const match2 = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (!fileId && match2) fileId = match2[1];

      if (fileId) {
        // FIXED: Using lh3.googleusercontent.com for direct image rendering
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    }

    // normal image URL
    return cleanUrl;
  } catch (err) {
    console.error("Image parsing error:", err);
    return "";
  }
};

// HELPER TO FORMAT TIMESTAMP AND EXTRACT WEEKDAY STRINGS
const formatTimestampWithDay = (timestampStr) => {
  if (!timestampStr) return "N/A";
  try {
    // Cross-browser normalization safety for standard strings 'YYYY-MM-DD HH:MM:SS'
    const cleanTs = timestampStr.toString().split(".")[0].replace("Z", "").replace("T", " ");
    const dateObj = new Date(cleanTs.replace(/-/g, "/"));
    
    if (isNaN(dateObj.getTime())) return timestampStr;

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = daysOfWeek[dateObj.getDay()];
    
    return `${dayName}, ${cleanTs}`;
  } catch (e) {
    return timestampStr;
  }
};

// COMPUTE DAYS INTERVAL FROM DIFFERENCE BETWEEN PAST TIMESTAMP AND CURRENT RUNTIME TIMESTAMP
const calculateDaysInterval = (pastTimestampStr, currentTimestampStr) => {
  if (!pastTimestampStr || !currentTimestampStr) return 0;
  try {
    const cleanPast = pastTimestampStr.toString().split(".")[0].replace("Z", "").replace("T", " ").replace(/-/g, "/");
    const cleanCurrent = currentTimestampStr.toString().split(".")[0].replace("Z", "").replace("T", " ").replace(/-/g, "/");
    
    const pastDate = new Date(cleanPast);
    const currentDate = new Date(cleanCurrent);
    
    if (isNaN(pastDate.getTime()) || isNaN(currentDate.getTime())) return 0;
    
    // Calculate difference in milliseconds
    const diffTime = Math.abs(currentDate - pastDate);
    // Convert to whole number days
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (e) {
    console.error("Error computing days interval mapping loop:", e);
    return 0;
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
  const [editGoodsPurchased, setEditGoodsPurchased] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);

  // VOICE RECOGNITION STATES
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const recognitionRef = useRef(null);

  // Hardware Ref Targets
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const lastLoggedTimeRef = useRef({});

  // RUNTIME CLOCK TRACKER STATE MATRIX FOR CURRENT VISITS
  const [currentTimeStamp, setCurrentTimeStamp] = useState("");

  // HIGH-SPEED MUTABLE REFS ENGINE
  const isEditingIdRef = useRef(null);
  const editGoodsPurchasedRef = useRef("");
  const editNeedsRef = useRef("");
  const editThinkingRef = useRef("");
  const editFeedbackRef = useRef("");
  const selectedMatchIndexRef = useRef(0);

  // Instantly reflect state changes into raw memory structures for loop safety
  useEffect(() => { isEditingIdRef.current = isEditingId; }, [isEditingId]);
  useEffect(() => { editGoodsPurchasedRef.current = editGoodsPurchased; }, [editGoodsPurchased]);
  useEffect(() => { editNeedsRef.current = editNeeds; }, [editNeeds]);
  useEffect(() => { editThinkingRef.current = editThinking; }, [editThinking]);
  useEffect(() => { editFeedbackRef.current = editFeedback; }, [editFeedback]);
  useEffect(() => { selectedMatchIndexRef.current = selectedMatchIndex; }, [selectedMatchIndex]);

  // Continuously maintain accurate live scanning client-side clock updates
  useEffect(() => {
    if (appMode !== "recognition") return;
    const clockInterval = setInterval(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      setCurrentTimeStamp(`${year}-${month}-${date} ${hours}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(clockInterval);
  }, [appMode]);

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

  // PROCESS VOICE SEGMENTS DIRECTLY VIA REFERENCE MATRIX
  const processVoiceOrder = (speechText) => {
    if (!speechText) return;
    const cleanSpeech = speechText.trim();
    
    if (isEditingIdRef.current !== null) {
      const existingText = editGoodsPurchasedRef.current;
      const combinedText = existingText ? `${existingText}, ${cleanSpeech}` : cleanSpeech;
      setEditGoodsPurchased(combinedText);
      editGoodsPurchasedRef.current = combinedText; 
    }
  };

  // INITIALIZE WEBSPEECH ENGINE AT STARTUP
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;      
      recognition.interimResults = true;  
      
      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage("🎙️ Voice Active: Speaking writes instantly.");
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition framework log error:", event.error);
        setStatusMessage(`Speech layer error: ${event.error} ⚠️`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          processVoiceOrder(finalTranscript);
        }

        if (isEditingIdRef.current !== null) {
          const baseText = editGoodsPurchasedRef.current;
          if (interimTranscript) {
            setEditGoodsPurchased(baseText ? `${baseText} ${interimTranscript}` : interimTranscript);
          } else {
            setEditGoodsPurchased(baseText);
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech API platform framework layer not supported inside this client.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); 

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage;
    }
  }, [selectedLanguage]);

  // COMBINED ENGINE: Activates Voice Capture & Automatically turns on Editable Mappings Simultaneously
  const toggleVoiceListening = (activeCust) => {
    if (!recognitionRef.current) {
      setStatusMessage("Speech tracking hardware unavailable ❌");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (activeCust && isEditingId !== (activeCust.customer_id || activeCust["customer_id"])) {
        const cId = activeCust.customer_id || activeCust["customer_id"];
        setIsEditingId(cId);
        setEditNeeds(activeCust.their_needs || activeCust["their_needs"] || "");
        setEditThinking(activeCust.thinking_to_purchase || activeCust["thinking_to_purchase"] || "");
        setEditFeedback(activeCust.feedback || activeCust["feedback"] || "");
        setEditGoodsPurchased(activeCust.goods_purchased || activeCust["goods_purchased"] || ""); 
        
        isEditingIdRef.current = cId;
        editGoodsPurchasedRef.current = activeCust.goods_purchased || activeCust["goods_purchased"] || "";
      }
      
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Speech interaction engine issue:", err);
      }
    }
  };

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
    if (isEditingIdRef.current) {
      autoCommitDataOnExit(isEditingIdRef.current);
    }
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

  const autoCommitDataOnExit = async (customerId) => {
    if (!customerId) return;
    try {
      console.log(`Auto-saving details for exited customer: ${customerId}`);
      await fetch(`${API_BASE_URL}/update_customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: String(customerId),
          their_needs: editNeedsRef.current.trim(),
          thinking_to_purchase: editThinkingRef.current.trim(),
          feedback: editFeedbackRef.current.trim(),
          goods_purchased: editGoodsPurchasedRef.current.trim() 
        }),
      });
      console.log("Exited customer records committed successfully.");
    } catch (error) {
      console.error("Auto commit failure:", error);
    }
  };

  const processServerMatches = (data, sourceWidth, sourceHeight) => {
    if ((!data.matches || data.matches.length === 0) && isEditingIdRef.current) {
      const exitedId = isEditingIdRef.current;
      setIsEditingId(null);
      isEditingIdRef.current = null;
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      autoCommitDataOnExit(exitedId);
      setStatusMessage("🚶 Customer left camera view. Data auto-saved to cloud! ✅");
    }

    if (data.matches && data.matches.length > 0) {
      if (isEditingIdRef.current) {
        const stillPresent = data.matches.some(m => m.identified && m.customer && (m.customer.customer_id || m.customer["customer_id"]) === isEditingIdRef.current);
        if (!stillPresent) {
          const exitedId = isEditingIdRef.current;
          setIsEditingId(null);
          isEditingIdRef.current = null;
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
          }
          autoCommitDataOnExit(exitedId);
          setStatusMessage("🚶 Customer stepped out of frame. Changes auto-saved! ✅");
        }
      }

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
      
      setIdentifiedMatches(prev => {
        return data.matches.map((newMatch, idx) => {
          if (prev[idx] && prev[idx].customer && newMatch.customer) {
            const oldId = prev[idx].customer.customer_id || prev[idx].customer["customer_id"];
            const newId = newMatch.customer.customer_id || newMatch.customer["customer_id"];
            
            if (oldId === newId) {
              const isCurrentlyEditingThisUser = isEditingIdRef.current === oldId;
              return {
                ...newMatch,
                customer: {
                  ...newMatch.customer,
                  goods_purchased: isCurrentlyEditingThisUser ? editGoodsPurchasedRef.current 
                  : (newMatch.customer.goods_purchased || prev[idx].customer.goods_purchased),
                  their_needs: isCurrentlyEditingThisUser ? editNeedsRef.current : (newMatch.customer.their_needs || prev[idx].customer.their_needs),
                  thinking_to_purchase: isCurrentlyEditingThisUser ? editThinkingRef.current : (newMatch.customer.thinking_to_purchase || prev[idx].customer.thinking_to_purchase),
                  feedback: isCurrentlyEditingThisUser ? editFeedbackRef.current : (newMatch.customer.feedback || prev[idx].customer.feedback)
                }
              };
            }
          }
          return newMatch;
        });
      });

      if (selectedMatchIndexRef.current >= data.matches.length) {
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
      if (responseData.error || responseData.success === false) {
        throw new Error(responseData.message || responseData.error || "Backend database transaction failed.");
      }

      if (responseData.acknowledged || responseData.status === "success") {
        const metadata = responseData.data || {};
        setStatusMessage(`🎉 Profile Registered Successfully! ID: ${metadata.customer_id || regId} • Database updated.`);
      }

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
          feedback: editFeedback.trim(),
          goods_purchased: editGoodsPurchased.trim() 
        }),
      });
      if (!response.ok) throw new Error(`CRM Mutation Endpoint Error: ${response.status}`);
      setIdentifiedMatches(prev => prev.map(match => {
        const c = match.customer;
        if (c && (c.customer_id || c["customer_id"]) === customerId) {
          return {
            ...match,
            customer: { 
              ...c, 
              their_needs: editNeeds.trim(), 
              thinking_to_purchase: editThinking.trim(),
              feedback: editFeedback.trim(),
              goods_purchased: editGoodsPurchased.trim()
            }
          };
        }
        return match;
      }));
      setStatusMessage("Records synchronized to spreadsheet ledger successfully ✅");
      setIsEditingId(null);
    } catch (error) {
      setStatusMessage(`Failed to save data layout: ${error.message} ❌`);
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
                  <div className="profile-header" style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div className="img-container" style={{ flexShrink: 0 }}>
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

                    <div className="header-text" style={{ flexGrow: 1, display: "flex", justifyContent: "space-between", gap: "10px" }}>
                      <div className="left-side-format" style={{ flex: "1 1 45%" }}>
                        <h3 style={{ marginBottom: "4px", fontSize: "1.25rem" }}>{activeCustomer.customer_name || activeCustomer["customer_name"]}</h3>
                        <p className="sub-text" style={{ margin: "2px 0" }}>ID: <strong>{activeCustomer.customer_id || activeCustomer["customer_id"]}</strong></p>
                        <p className="sub-text" style={{ margin: "2px 0" }}>Confidence: <strong style={{color: '#4caf50'}}>{Math.round(activeMatch.confidence * 100)}%</strong></p>
                        <p className="sub-text" style={{ margin: "2px 0" }}>Phone: <strong>{activeCustomer.phone_no || activeCustomer["phone_no"] || "N/A"}</strong></p>
                      </div>

                      <div className="right-side-format" style={{ flex: "1 1 55%", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ background: "#f0f7ff", padding: "6px 8px", borderRadius: "4px", border: "1px solid #bfdbfe" }}>
                          <span style={{ display: "block", color: "#1e40af", fontWeight: "700", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>Current Timestamp with Day</span>
                          <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "0.78rem", display: "block", whiteSpace: "normal" }}>{formatTimestampWithDay(currentTimeStamp)}</span>
                        </div>
                        
                        <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                          <span style={{ display: "block", color: "#64748b", fontWeight: "700", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>Previous Timestamp with Day</span>
                          <span style={{ color: "#334155", fontWeight: "600", fontSize: "0.78rem", display: "block", whiteSpace: "normal" }}>
                            {formatTimestampWithDay(
                              activeCustomer.timestamp_with_day || 
                              activeCustomer["timestamp_with_day"] ||
                              activeCustomer.last_visit_timestamp || 
                              "N/A"
                            )}
                          </span>
                        </div>
                        
                        <div style={{ background: "#fff5f5", padding: "5px 8px", borderRadius: "4px", border: "1px solid #fee2e2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#991b1b", fontWeight: "700", fontSize: "0.7rem", textTransform: "uppercase" }}>Days Interval:</span>
                          <span style={{ color: "#ef4444", fontWeight: "800", fontSize: "0.9rem" }}>
                            {calculateDaysInterval(
                              activeCustomer.timestamp_with_day || 
                              activeCustomer["timestamp_with_day"] ||
                              activeCustomer.last_visit_timestamp, 
                              currentTimeStamp
                            )} Days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginTop: "15px" }}>
                    <div className="info-item">
                      <label>Total Visits Today</label>
                      <span className="highlight-blue">
                        {activeCustomer.total_visit_per_day || activeCustomer["total_visit_per_day"] || "1"}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Transaction Limit</label>
                      <span className="text-success">${activeCustomer.transaction_limit || activeCustomer["transaction_limit"] || "0"}</span>
                    </div>
                  </div>

                  <div className="purchased-section" style={{ borderLeft: "4px solid #10b981", marginTop: "15px" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
    <label style={{ margin: 0 }}>Goods Purchased (Real-Time Voice Setup)</label>
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      <select 
        value={selectedLanguage} 
        onChange={(e) => setSelectedLanguage(e.target.value)} 
        className="crm-input" 
        style={{ padding: "2px 6px", fontSize: "0.75rem", width: "auto", height: "auto" }}
      >
        <option value="en-US">🇺🇸 English</option>
        <option value="hi-IN">🇮🇳 Hindi (हिंदी)</option>
        <option value="ne-NP">🇳🇵 Nepali (नेपाली)</option>
        <option value="mai-IN">🌾 Maithili (मैथिली)</option>
        <option value="bho-IN">🏺 Bhojpuri (भोजपुरी)</option>
      </select>
      <button 
        type="button" 
        onClick={() => toggleVoiceListening(activeCustomer)} 
        className="btn-edit" 
        style={{ backgroundColor: isListening ? "#ef4444" : "#10b981", color: "white", borderColor: "transparent", padding: "3px 8px", display: "flex", alignItems: "center", gap: "4px" }}
      >
        {isListening ? "🛑 Stop Mic" : "🎙️ Speak Live"}
      </button>
    </div>
  </div>
  
  {/* Editable Goods Section */}
  <div className="goods-box" style={{ fontWeight: "600", color: "#1e293b", minHeight: "18px" }}>
    {isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"]) ? (
      <textarea 
        className="crm-textarea"
        value={editGoodsPurchased}
        onChange={(e) => setEditGoodsPurchased(e.target.value)}
        style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
        placeholder="Type here or use voice..."
      />
    ) : (
      activeCustomer.goods_purchased || "No Records Found"
    )}
  </div>
</div>

                  <div className="mutations-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                    <div className="input-group-layout">
                      <label>Current Needs Map</label>
                      <textarea value={isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"]) ? editNeeds : (activeCustomer.their_needs || "")} onChange={(e) => { if (isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"])) { setEditNeeds(e.target.value); } }} disabled={isEditingId !== (activeCustomer.customer_id || activeCustomer["customer_id"])} className="crm-textarea" placeholder="N/A" />
                    </div>
                    <div className="input-group-layout">
                      <label>Thinking to Purchase</label>
                      <textarea value={isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"]) ? editThinking : (activeCustomer.thinking_to_purchase || "")} onChange={(e) => { if (isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"])) { setEditThinking(e.target.value); } }} disabled={isEditingId !== (activeCustomer.customer_id || activeCustomer["customer_id"])} className="crm-textarea" placeholder="N/A" />
                    </div>
                  </div>

                  <div className="input-group-layout" style={{ marginTop: "12px" }}>
                    <label>Interaction & Sentiment Feedback</label>
                    <textarea value={isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"]) ? editFeedback : (activeCustomer.feedback || "")} onChange={(e) => { if (isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"])) { setEditFeedback(e.target.value); } }} disabled={isEditingId !== (activeCustomer.customer_id || activeCustomer["customer_id"])} className="crm-textarea" placeholder="No feedback logged." />
                  </div>

                  <div className="action-buttons-container" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    {isEditingId === (activeCustomer.customer_id || activeCustomer["customer_id"]) ? (
                      <>
                        <button className="save-btn" onClick={() => handleSaveCRMData(activeCustomer.customer_id || activeCustomer["customer_id"])} disabled={saving}>
                          {saving ? "Synchronizing..." : "💾 Commit Layout Adjustments"}
                        </button>
                        <button className="cancel-btn" style={{ background: "#64748b", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }} onClick={() => setIsEditingId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button className="edit-trigger-btn" style={{ background: "#4f46e5", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", fontWeight: "600", width: "100%" }} onClick={() => {
                        const cId = activeCustomer.customer_id || activeCustomer["customer_id"];
                        setIsEditingId(cId);
                        setEditNeeds(activeCustomer.their_needs || "");
                        setEditThinking(activeCustomer.thinking_to_purchase || "");
                        setEditFeedback(activeCustomer.feedback || "");
                        setEditGoodsPurchased(activeCustomer.goods_purchased || "");
                      }}>
                        📝 Modify Profile Fields Manually
                      </button>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="profile-card registration-card layout-form-box fade-in">
                <div className="registration-header-block">
                  <h2>Register Face Vector Data Node</h2>
                  <p className="sub-text">Map physical features to standard database profile definitions</p>
                </div>

                <form onSubmit={handleRegisterCustomer} className="registration-system-form">
                  <div className="form-row-split">
                    <div className="input-group-layout">
                      <label>Target Identifier ID *</label>
                      <input type="text" required value={regId} onChange={(e) => setRegId(e.target.value)} className="crm-input" placeholder="e.g. KM-2026-89" />
                    </div>
                    <div className="input-group-layout">
                      <label>Full Structural Name *</label>
                      <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} className="crm-input" placeholder="e.g. Rahul Sharma" />
                    </div>
                  </div>

                  <div className="input-group-layout">
                    <label>Active Contact Number</label>
                    <input type="text" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="crm-input" placeholder="e.g. +91 9876543210" />
                  </div>

                  <div className="input-group-layout">
                    <label>CRM Funnel Status</label>
                    <select value={regStatus} onChange={(e) => setRegStatus(e.target.value)} className="crm-input">
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