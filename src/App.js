import React, { useState, useRef } from "react";
import ParkingDetection from "./ParkingDetection.js";
import ParkingDashboard from "./ParkingDashboard.js";
import ParkingReservation from "./ParkingReservation.js";
import ParkingAnalytics from "./ParkingAnalytics.js";
import Chatbot from "./ChatBot.js"; // Ensure file and import spelling matches exactly
import './App.css';

const sampleImages = [
  "20231018_165934.jpg",
  "20231020_161910.jpg",
  "20231025_153840.jpg",
  "20231025_153914.jpg",
  "20231025_154019.jpg",
  "20231025_154152.jpg",
  "20231025_165322.jpg"
];

function App() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [records, setRecords] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const apiUrl = process.env.REACT_APP_API_BASE;
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
  };

  if (!user) {
    return (
      <div className="main-container">
        <h1>Smart Parking Management</h1>
        <div style={{ marginBottom: 18 }}>
          <form onSubmit={handleUserSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 320, margin: "0 auto" }}>
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
      </div>
    );
  }

  return (
    <>
      <div className="main-container">
        <h1>Smart Parking Management</h1>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>
          Welcome{isGuest ? " Guest" : ", " + user.name}!
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
                  style={{ width: 90, height: 60, objectFit: "cover", borderRadius: 8, boxShadow: "0 2px 8px #ccc", cursor: "pointer" }}
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
      </div>

      {showChat && (
        <div style={{
          position: "fixed",
          bottom: 90,
          right: 36,
          zIndex: 2000,
          width: 400,
          boxShadow: "0 6px 36px #aaa",
          borderRadius: 18,
          backgroundColor: "white"
        }}>
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
         <svg width="36" height="36" fill="white" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v17l4-4h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
      </button>
    </>
  );
}

export default App;
