import React, { useState } from "react";

const validateEmail = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const MINUTES_OPTIONS = [15, 30, 45, 60, 90, 120];
const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00"
];

// Assign friendly spot names for dropdown
const makeFriendlyName = (spot, idx) =>
  spot.spot || spot.id || spot.name || `Spot ${idx + 1}`;

function Chatbot({ detectedSpots = [] }) {
  const [stage, setStage] = useState(0);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Welcome to Smart Parking! What is your name?" }
  ]);
  const [userData, setUserData] = useState({ name: "", email: "", spot: "", time: "", duration: MINUTES_OPTIONS[0] });
  const [loading, setLoading] = useState(false);

  // Find available spots and assign human-friendly names
  const availableSpots = detectedSpots
    .filter(s => s.class === "empty" || (s.label && s.label.toLowerCase() === "empty"));
  const spotOptions = availableSpots.map(makeFriendlyName);

  // Conversation step advancement
  const handleNext = value => {
    if (stage === 0) {
      setUserData(data => ({ ...data, name: value }));
      setMessages(msgs => [...msgs, { from: "user", text: value }, { from: "bot", text: "What is your email address?" }]);
      setStage(1);
    } else if (stage === 1) {
      if (!validateEmail(value)) {
        setMessages(msgs => [
          ...msgs,
          { from: "user", text: value },
          { from: "bot", text: "Please enter a valid email address." }
        ]);
        return;
      }
      setUserData(data => ({ ...data, email: value }));
      setMessages(msgs => [
        ...msgs,
        { from: "user", text: value },
        availableSpots.length
          ? { from: "bot", text: `There are ${availableSpots.length} parking spots available: ${spotOptions.join(", ")}. Please select one to book.` }
          : { from: "bot", text: "Sorry! No spots available at the moment." }
      ]);
      setStage(2);
    } else if (stage === 2) {
      if (!spotOptions.includes(value)) {
        setMessages(msgs => [
          ...msgs,
          { from: "user", text: value },
          { from: "bot", text: "Please select a valid available spot from the list." }
        ]);
        return;
      }
      setUserData(data => ({ ...data, spot: value }));
      setMessages(msgs => [
        ...msgs,
        { from: "user", text: value },
        { from: "bot", text: "Select your reservation start time:" }
      ]);
      setStage(3);
    } else if (stage === 3) {
      if (!TIME_OPTIONS.includes(value)) {
        setMessages(msgs => [
          ...msgs,
          { from: "user", text: value },
          { from: "bot", text: "Pick a valid start time from the options." }
        ]);
        return;
      }
      setUserData(data => ({ ...data, time: value }));
      setMessages(msgs => [
        ...msgs,
        { from: "user", text: value },
        { from: "bot", text: "Select duration for reservation (in minutes):" }
      ]);
      setStage(4);
    } else if (stage === 4) {
      const durationInt = parseInt(value, 10);
      if (!MINUTES_OPTIONS.includes(durationInt)) {
        setMessages(msgs => [
          ...msgs,
          { from: "user", text: value },
          { from: "bot", text: "Select a valid duration from the options." }
        ]);
        return;
      }
      setUserData(data => ({ ...data, duration: durationInt }));
      setMessages(msgs => [
        ...msgs,
        { from: "user", text: value },
        {
          from: "bot",
          text: `Congratulations ${userData.name}! Your parking spot "${userData.spot}" is reserved from ${userData.time} for ${durationInt} minutes.`
        }
      ]);
      setStage(5);
    }
    setInput("");
  };

  // UI element for each conversation step
  let inputElem = null;
  if (stage === 2 && spotOptions.length) {
    inputElem = (
      <select value={input} onChange={e => setInput(e.target.value)} style={{
        width: "70%", padding: 10, borderRadius: 12, background: "#fff8e7", fontWeight: 600, fontSize: 16
      }}>
        <option value="">Select spot</option>
        {spotOptions.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
    );
  } else if (stage === 3) {
    inputElem = (
      <select value={input} onChange={e => setInput(e.target.value)} style={{
        width: "70%", padding: 10, borderRadius: 12, background: "#e8eaf6", fontWeight: 600, fontSize: 16
      }}>
        <option value="">Select time</option>
        {TIME_OPTIONS.map((t, i) => <option key={i} value={t}>{t}</option>)}
      </select>
    );
  } else if (stage === 4) {
    inputElem = (
      <select value={input} onChange={e => setInput(e.target.value)} style={{
        width: "70%", padding: 10, borderRadius: 12, background: "#ffe0b2", fontWeight: 600, fontSize: 16
      }}>
        <option value="">Select duration</option>
        {MINUTES_OPTIONS.map((m, i) => <option key={i} value={m}>{m} min</option>)}
      </select>
    );
  } else if (stage < 5) {
    inputElem = (
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        style={{
          width: "70%", padding: 10, borderRadius: 12,
          border: "1px solid #ddd", background: "#f5f5fa", fontWeight: 500, fontSize: 16
        }}
        onKeyDown={e => { if (e.key === "Enter") handleNext(input.trim()); }}
        disabled={loading}
        placeholder="Type here..."
      />
    );
  }

  return (
    <div style={{
      maxWidth: 420,
      margin: "2rem auto",
      background: "rgba(255,255,255,0.97)",
      border: "none",
      borderRadius: 24,
      padding: 28,
      boxShadow: "0 8px 44px 0 rgba(130,51,130,0.16), 0 2px 8px #ffa70055",
      backdropFilter: "blur(3px)"
    }}>
      <div style={{ minHeight: 240, marginBottom: 12 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: "flex",
            justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
            margin: "10px 0"
          }}>
            <div style={{
              background: msg.from === "user"
                ? "linear-gradient(135deg, #fffde4 0%, #ffe8a3 100%)"
                : "linear-gradient(120deg, #eef6f9 0%, #ede7f6 100%)",
              color: "#444",
              borderRadius: 16,
              padding: "10px 16px 11px 18px",
              boxShadow: msg.from === "user"
                ? "0 1px 8px #ffd54f44"
                : "0 1px 6px #e1bee755",
              fontWeight: msg.from === "user" ? 500 : 400,
              maxWidth: 280,
              wordBreak: "break-word",
              fontSize: "17px"
            }}>
              <b>{msg.from === "user" ? "You" : "Bot"}: </b>{msg.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 8,
        display: "flex",
        alignItems: "center"
      }}>
        {inputElem}
        {stage < 5 && (
          <button
            onClick={() => handleNext(input.trim())}
            disabled={loading || (input === "" && stage !== 2 && stage !== 3 && stage !== 4)}
            style={{
              width: "30%",
              padding: "11px 0",
              marginLeft: 10,
              background: "linear-gradient(90deg, #ffa700 0%, #8e24aa 100%)",
              color: "#fff",
              borderRadius: 18,
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px #eee",
              fontSize: 17,
              opacity: loading ? 0.7 : 1,
              transition: "all 0.15s"
            }}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Chatbot;
