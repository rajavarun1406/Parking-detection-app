import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ParkingAnalytics({ records }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (records.length) {
      setHistory(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          slots: records[records.length - 1].predictions ? records[records.length - 1].predictions.length : 0
        }
      ]);
    }
  }, [records]);

  return (
    <div className="section" style={{ marginTop: 24 }}>
      <h2>Historical Data & Analytics</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="slots" stroke="#8C1D40" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
