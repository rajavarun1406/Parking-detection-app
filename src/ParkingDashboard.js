import React from "react";
export default function ParkingDashboard({ predictions }) {
  const occupied = predictions.filter(p => p.class === "occupied").length;
  const empty = predictions.filter(p => p.class === "empty").length;
  const total = occupied + empty;
  const rate = total ? ((occupied / total) * 100).toFixed(1) : 0;

  return (
    <div style={{border:"1px solid #eee", padding: 10, margin: "20px 0"}}>
      <h2>Real-Time Monitoring Dashboard</h2>
      <p>Available Slots: {empty}</p>
      <p>Occupied Slots: {occupied}</p>
      <p>Occupancy Rate: {rate}%</p>
      {occupied === total && total > 0 && <p style={{color:"red"}}>Full: No slots available!</p>}
    </div>
  );
}
