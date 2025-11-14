import React, { useState } from "react";
import axios from "axios";

export default function ParkingDashboard({ predictions }) {
  const occupied = predictions.filter(p => p.class === "occupied").length;
  const empty = predictions.filter(p => p.class === "empty").length;
  const total = occupied + empty;
  const rate = total ? ((occupied / total) * 100).toFixed(1) : 0;

  const [summary, setSummary] = useState("");

  // Button handler: get natural language summary from backend
  const getSummary = async () => {
    try {
      const res = await axios.post("https://smart-parking-detection.onrender.com", {
        detectedSpots: predictions
      });
      setSummary(res.data.summary);
    } catch (e) {
      setSummary("Could not connect to summary service.");
    }
  };

  return (
    <div style={{border:"1px solid #eee", padding: 10, margin: "20px 0"}}>
      <h2>Real-Time Monitoring Dashboard</h2>
      <p>Available Slots: {empty}</p>
      <p>Occupied Slots: {occupied}</p>
      <p>Occupancy Rate: {rate}%</p>
      {occupied === total && total > 0 && (
        <p style={{color:"red"}}>Full: No slots available!</p>
      )}
      <button 
        style={{
          marginTop:12,
          padding:"8px 16px",
          background:"linear-gradient(90deg, #ffa700 0%, #e68337 100%)",
          color: "white",
          fontWeight: "bold",
          borderRadius:6,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 8px #eee"
        }}
        onClick={getSummary}
      >
        Summarize Lot Status
      </button>

      {summary && (
        <div style={{marginTop:12, background:"#f6ffed", padding:10, borderRadius:6}}>
          <b>Summary:</b> {summary}
        </div>
      )}
    </div>
  );
}
