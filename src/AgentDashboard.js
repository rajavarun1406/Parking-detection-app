import React, { useState } from "react";

// Header component as in the example screenshot
function AgentHeader({ status = "active", lastUpdate }) {
  const isActive = status === "active";
  return (
    <div style={{
      width: "90%",
      margin: "0 auto 28px auto",
      borderRadius: 22,
      background: "linear-gradient(90deg,rgba(255,255,255,0.61) 0%,rgba(235,191,244,0.65) 100%)",
      boxShadow: "0 1.2px 13px #cabede18",
      border: "1.2px solid #f3e2fc",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "22px 33px 16px 32px",
      fontFamily: "Rubik,sans-serif"
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <span style={{ fontSize: 30, marginRight: 4 }}>🚗</span>
          <span style={{
            fontWeight: 800, fontSize: 27, color: '#863faa', letterSpacing: '.01em'
          }}>Smart Parking Agent</span>
        </div>
        <div style={{ fontSize: 14, marginTop: 3, color: "#78447a", fontWeight: 500 }}>
          Live monitoring • Parking Occupancy Tracker
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          background: isActive
            ? "linear-gradient(90deg,#d7f7e5 0%,#c8f7f3 100%)"
            : "linear-gradient(90deg,#ffdde7 0%,#eb99b5 100%)",
          color: isActive ? "#178463" : "#be2e47",
          fontWeight: 700,
          fontSize: 15,
          borderRadius: 13,
          padding: "4.5px 15px 4px 13px",
          boxShadow: isActive ? "0 0.5px 5px #44aa8844" : "0 0.5px 5px #fbc4cf38"
        }}>
          <span style={{
            marginRight: 6, fontSize: 18, verticalAlign: "middle"
          }}>
            {isActive ?
              <span style={{ color: "#18a825" }}>🟢</span>
              : <span style={{ color: "#f44d70" }}>🔴</span>}
          </span>
          {isActive ? "Active" : "Inactive"}
        </div>
        <div style={{
          fontSize: 12,
          color: "#949091",
          marginTop: 2,
          fontWeight: 400
        }}>
          Last update: {lastUpdate}
        </div>
      </div>
    </div>
  );
}

// Main Agent Dashboard
function getStatsFromRecords(records) {
  return records.map((rec, idx) => {
    const preds = rec.predictions || [];
    const empty = preds.filter(s => (s.class || "").toLowerCase() === "empty").length;
    const occupied = preds.filter(s => (s.class || "").toLowerCase() === "occupied").length;
    const lowConf = preds.filter(s => (s.confidence || 1) < 0.5).length;
    const avgConf = preds.length ? Math.round(100 * preds.reduce((a, c) => a + (c.confidence || 1), 0) / preds.length) : 0;
    return {
      scanTime: rec.time,
      totalSpots: empty + occupied,
      empty,
      occupied,
      lowConf,
      avgConf,
      occupancyRate: (empty + occupied) > 0 ? Math.round(100 * occupied / (empty + occupied)) : 0
    };
  });
}

export default function AgentDashboard({ records = [], predictions = [], summary = "", user = {} }) {
  const [showReport, setShowReport] = useState(false);

  // Simulate agent status (customize logic as needed)
  const agentStatus = "active"; // or "inactive"
  const lastUpdate = new Date().toLocaleTimeString(); // Or use real update tracking

  const scansToday = records.length;
  const allPreds = records.flatMap(r => r.predictions || []);
  const lowConf = allPreds.filter(p => (p.confidence || 1) < 0.5).length;
  const avgConf = allPreds.length ? Math.round(100 * allPreds.reduce((a, c) => a + (c.confidence || 1), 0) / allPreds.length) : 0;
  const pending = allPreds.filter(p => (p.confidence || 1) < 0.5);
  const dailyStats = getStatsFromRecords(records);

  const reportDetail = () => `
Smart Parking Agent - Summary Report

User: ${user?.name || "Unknown"}, Scans: ${scansToday}
------------------------------------------------------
${dailyStats.map((stat, idx) =>
  `Scan #${idx + 1} [${stat.scanTime}]
   Empty: ${stat.empty}, Occupied: ${stat.occupied}, Occupancy: ${stat.occupancyRate}%, Low Conf: ${stat.lowConf}, Avg Confidence: ${stat.avgConf}%`
).join("\n\n")}
Pending Review: ${
    pending.length
      ? pending.map((p, i) => `${i + 1}. ${p.class || "N/A"} (${Math.round(100*(p.confidence||0))/100})`).join(" | ")
      : "None"
    }
`.trim();

  return (
    <div
      className="main-container"
      style={{
        borderRadius: 36,
        margin: '32px auto 0 auto',
        padding: "30px 34px 45px 34px",
        background: "rgba(255,238,208,0.95)", // adjust opacity/color as needed
        boxShadow: "0 6px 32px #ffd9c160, 0 2px 8px #ea74ff13",
        maxWidth: 980
      }}
    >
      {/* Premium Banner */}
      <AgentHeader status={agentStatus} lastUpdate={lastUpdate} />

      <div
        style={{
          display: "flex",
          gap: 32,
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: 30,
        }}
      >
        <div
          style={{
            background: "#fff7f1",
            border: "1.3px solid #fbdbbc",
            borderRadius: 20,
            padding: "15px 36px",
            minWidth: 152,
            fontSize: 14,
            color: "#be5149",
            fontWeight: 700,
            boxShadow: "0 2px 12px #f8e1c366",
            textAlign: "center"
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 1 }}>Scans Today</div>
          <div style={{ fontWeight: 800, fontSize: 28 }}>{scansToday}</div>
        </div>
        <div
          style={{
            background: "#fff7f1",
            border: "1.3px solid #fbdbbc",
            borderRadius: 20,
            padding: "15px 36px",
            minWidth: 152,
            fontSize: 14,
            color: "#b83975",
            fontWeight: 700,
            boxShadow: "0 2px 12px #fbc9da44",
            textAlign: "center"
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 1 }}>Low Confidence</div>
          <div style={{ fontWeight: 800, fontSize: 28 }}>{lowConf}</div>
        </div>
        <div
          style={{
            background: "#fff7f1",
            border: "1.3px solid #fbdbbc",
            borderRadius: 20,
            padding: "15px 36px",
            minWidth: 152,
            fontSize: 14,
            color: "#21a58b",
            fontWeight: 700,
            boxShadow: "0 2px 12px #adebd555",
            textAlign: "center"
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 1 }}>Avg Confidence</div>
          <div style={{ fontWeight: 800, fontSize: 28 }}>{avgConf}%</div>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1.2px solid #fbdbbc",
          borderRadius: 17,
          margin: "23px 0 27px 0",
          padding: "16px 28px 18px 28px",
          boxShadow: "0 1.7px 13px #f3c5ec13"
        }}
      >
        <div style={{
          color: "#b24673",
          fontWeight: 700,
          fontSize: 17,
          marginBottom: 4,
          fontFamily: "Rubik,sans-serif"
        }}>Pending Your Review</div>
        {pending.length === 0 ? (
          <div style={{ color: "#18ad5f", fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
            <span style={{ fontSize: 17 }}>✓</span> No pending actions
            <div style={{
              fontWeight: 400,
              color: "#719265",
              fontSize: 13,
              marginTop: 2
            }}>
              Agent is monitoring autonomously
            </div>
          </div>
        ) : (
          <ul style={{ fontSize: 13, margin: "8px 0 0 19px", color: "#c62357", fontWeight: 600 }}>
            {pending.map((p, i) => (
              <li key={i}>
                {p.class || "Unknown"} <span style={{ color: "#930" }}>({Math.round(100 * (p.confidence || 0)) / 100})</span>
                &nbsp;— Review Required
              </li>
            ))}
          </ul>
        )}
        <button
          style={{
            marginTop: 15,
            background: "linear-gradient(90deg,#f1dadf 0%,#fff6ff 100%)",
            border: "none",
            padding: "8px 19px",
            borderRadius: 8,
            color: "#8e24aa",
            fontWeight: 700,
            fontSize: "15px",
            letterSpacing: ".02em",
            cursor: "pointer",
            boxShadow: "0 1.5px 9px #ea74ff13"
          }}
          onClick={() => setShowReport(true)}
        >
          <span style={{ fontSize: 17, verticalAlign: "middle", marginRight: 4 }}>📑</span> Trigger Test Report
        </button>
      </div>

      <div
        style={{
          background: "#fffcf8",
          borderRadius: 16,
          padding: "16px 16px 10px 19px",
          border: "1.2px solid #fbdbbc",
          boxShadow: "0 1.5px 12px #efd1c113",
          marginBottom: 0
        }}
      >
        <div style={{
          fontWeight: 700,
          color: "#8e24aa",
          fontSize: 15,
          marginBottom: 10,
          letterSpacing: ".005em",
          fontFamily: "Rubik,sans-serif"
        }}>Daily Progress Reports</div>
        {dailyStats.length === 0 &&
          <div style={{ color: "#bbb", fontSize: 13 }}>No scans yet today.</div>
        }
        {dailyStats.map((stat, idx) => (
          <div key={idx} style={{
            borderBottom: idx === dailyStats.length - 1 ? "none" : "1px solid #f8e9e2",
            padding: "5px 0 9px 9px", color: "#674a77", fontSize: 13, fontWeight: 500
          }}>
            <b>Scan {idx + 1} <span style={{ color: "#aaa", fontWeight: 400 }}>({stat.scanTime})</span></b> &nbsp;|&nbsp;
            <span style={{ color: "#367c5e" }}>Empty:</span> {stat.empty} &nbsp;|&nbsp;
            <span style={{ color: "#a2605e" }}>Occupied:</span> {stat.occupied} &nbsp;|&nbsp;
            <span>Occupancy:</span> {stat.occupancyRate}%
          </div>
        ))}
      </div>

      {showReport && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(194,102,221,0.13)", zIndex: 1200,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            width: "93vw", maxWidth: 500,
            borderRadius: 17,
            boxShadow: "0 10px 34px #ffe4e8, 0 0.5px 1.5px #0001",
            padding: "27px 13px"
          }}>
            <div style={{
              fontWeight: 800, fontSize: 16,
              color: "#8e24aa", marginBottom: 7,
              fontFamily: "Rubik,sans-serif"
            }}>Agent Detailed Report</div>
            <pre style={{
              background: "#fffbfd",
              padding: "10px",
              borderRadius: 10,
              color: "#343265",
              fontSize: 13,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "44vh",
              overflow: "auto",
              fontFamily: "Fira Mono,Consolas,monospace"
            }}>{reportDetail()}</pre>
            <button style={{
              marginTop: 9,
              padding: "8px 19px",
              background: "#ede7fa",
              border: "none", borderRadius: 8,
              color: "#8e24aa", fontWeight: 600,
              fontSize: 13, cursor: "pointer"
            }} onClick={() => setShowReport(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
