import React, { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import ParkingDetection from "./ParkingDetection.js";
import ParkingDashboard from "./ParkingDashboard.js";
import ParkingReservation from "./ParkingReservation.js";
import ParkingAnalytics from "./ParkingAnalytics.js";
import Chatbot from "./ChatBot.js";
import AgentDashboard from "./AgentDashboard.js";
import "./App.css";

const sampleImages = [
  "20231018_165934.jpg",
  "20231020_161910.jpg",
  "20231025_153840.jpg",
  "20231025_153914.jpg",
  "20231025_154019.jpg",
  "20231025_154152.jpg",
  "20231025_165322.jpg"
];


function TopNav() {
  const location = useLocation();
  return (
    <nav
      style={{
        background: "linear-gradient(90deg,rgba(255,245,200,0.73) 0%,rgba(255,220,210,0.66) 100%)",
        boxShadow: "0 2px 15px #c98c7a0e",
        borderRadius: '0 0 22px 22px',
        padding: "10px 38px 8px 38px",
        margin: "0 auto 2vw auto",
        maxWidth: 1080,
        fontFamily: "Rubik,sans-serif",
        display: "flex",
        gap: 30,
        alignItems: "center",
        fontSize: 18,
        backdropFilter: "blur(7px)"
      }}
    >
      <Link
        to="/"
        style={{
          fontWeight: 600,
          color: location.pathname === "/" ? "#cc6714" : "#706454",
          textDecoration: "none",
          fontSize: 18,
          letterSpacing: ".01em",
          marginRight: 2
        }}
      >
        Main App
      </Link>
      <Link
        to="/agent-dashboard"
        style={{
          fontWeight: 600,
          color: location.pathname === "/agent-dashboard" ? "#cc6714" : "#706454",
          textDecoration: "none",
          fontSize: 18,
          letterSpacing: ".01em"
        }}
      >
        Agent Dashboard
      </Link>
    </nav>
  );
}



function App() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState("");
  const [showChat, setShowChat] = useState(false);
  const parkingDetectionRef = useRef();

  const handleSampleClick = (filename) => {
    const url = `${process.env.PUBLIC_URL}/sample-images/${filename}`;
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], filename, { type: blob.type });
        if (parkingDetectionRef.current) {
          parkingDetectionRef.current.handleFileUpload(file);
        }
      })
      .catch(console.error);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    if (name && email) setUser({ name, email });
  };

  const handleGuest = () => {
    setIsGuest(true);
    setUser({ name: "Guest", email: "guest@smartparking.com" });
  };

  const handleDetect = (preds) => {
    setPredictions(preds);
    setRecords((prev) => [...prev, { predictions: preds, time: new Date().toLocaleTimeString() }]);
    fetchSummary({ detectedSpots: preds });
    // Optionally log scan here
  };

  const fetchSummary = async (parkingData) => {
    try {
      const response = await fetch("/summarize_parking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parkingData),
      });
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      setSummary("Could not connect to summary service.");
    }
  };

  if (!user) {
    return (
      <div className="main-container">
        <h1>Smart Parking Management</h1>
        <form onSubmit={handleUserSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 320, margin: "0 auto" }}>
          <label>
            Name:
            <input name="name" required maxLength={32} style={{ marginLeft: 6, padding: 6, width: "100%" }} />
          </label>
          <label>
            Email:
            <input name="email" required type="email" style={{ marginLeft: 6, padding: 6, width: "100%" }} />
          </label>
          <button type="submit" style={{ marginTop: 8 }}>Continue</button>
        </form>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          — Or —<br />
          <button onClick={handleGuest} style={{ marginTop: 10, background: "#dadada", color: "#444" }}>Login as Guest</button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <TopNav />
      <Routes>
        <Route
          path="/agent-dashboard"
          element={
            <AgentDashboard
              records={records}
              predictions={predictions}
              summary={summary}
              user={user}
            />
          }
        />
        <Route
          path="/"
          element={
            <div className="main-container">
              <h1>Smart Parking Management</h1>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>
                Welcome{isGuest ? " Guest" : `, ${user.name}`}!
              </div>
              <ParkingDetection ref={parkingDetectionRef} onDetect={handleDetect} />
              <div className="sample-gallery" style={{ marginBottom: 24 }}>
                <h3>Sample Images</h3>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {sampleImages.map((name) => (
                    <div key={name} style={{ textAlign: "center" }}>
                      <img
                        src={`${process.env.PUBLIC_URL}/sample-images/${name}`}
                        alt={name}
                        style={{
                          width: 90,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                          boxShadow: "0 2px 8px #ccc",
                          cursor: "pointer"
                        }}
                        onClick={() => handleSampleClick(name)}
                      />
                      <div style={{ fontSize: 13, marginTop: 4 }}>{name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <ParkingDashboard predictions={predictions} />
              <ParkingReservation predictions={predictions} user={user} isGuest={isGuest} />
              <ParkingAnalytics records={records} />
              {showChat && (
                <div
                  style={{
                    position: "fixed",
                    bottom: 90,
                    right: 36,
                    zIndex: 2000,
                    width: 400,
                    boxShadow: "0 6px 36px #aaa",
                    borderRadius: 18,
                    backgroundColor: "white"
                  }}
                >
                  <Chatbot detectedSpots={predictions} onClose={() => setShowChat(false)} />
                </div>
              )}
              <button
                style={{
                  position: "fixed",
                  bottom: 20,
                  right: 20,
                  zIndex: 2100,
                  width: 68,
                  height: 68,
                  background: "linear-gradient(135deg, #8e24aa 0%, #ffa700 100%)",
                  border: "none",
                  borderRadius: "50%",
                  boxShadow: "0px 8px 24px rgba(60,30,75,0.30), 0px 2px 8px #ffa70055",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  outline: "none"
                }}
                onClick={() => setShowChat((v) => !v)}
                title="Open chatbot"
              >
                <svg width={36} height={36} fill="white" viewBox="0 0 24 24">
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v17l4-4h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                </svg>
              </button>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
