import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ParkingReservation({ predictions }) {
  const emptySlots = predictions.filter(p => p.class === "empty");
  const [reserved, setReserved] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    start: new Date(),
    end: new Date(new Date().getTime() + 3600000)
  });
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState({});

  // Simple email validation regex
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!validateEmail(form.email)) newErrors.email = "Invalid email format.";
    if (!form.start) newErrors.start = "Start time required.";
    if (!form.end) newErrors.end = "End time required.";
    else if (form.end <= form.start) newErrors.end = "End must be after start.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const notifyUser = (email, details) => {
    setConfirmation(
      `Notification sent to ${email}: Your reservation for spot ${details.spotId} is confirmed from ${details.start.toLocaleString()} to ${details.end.toLocaleString()}.`
    );
  };

  const handleReserve = slot => {
    if (!validateForm()) return;
    setReserved([...reserved, slot.detection_id]);
    notifyUser(form.email, {
      spotId: slot.detection_id,
      name: form.name,
      start: form.start,
      end: form.end
    });
    setForm({
      name: "",
      email: "",
      start: new Date(),
      end: new Date(new Date().getTime() + 3600000)
    }); // reset form
    setErrors({});
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 16, margin: "20px 0" }}>
      <h2>Parking Reservation</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
        }}
        style={{
          marginBottom: 10,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center"
        }}
        autoComplete="off"
      >
        <label>
          Name:
          <input
            type="text"
            required
            style={{ margin: "0 8px" }}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            autoComplete="off"
          />
          {errors.name && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.name}</span>
          )}
        </label>
        <label>
          Email:
          <input
            type="email"
            required
            style={{ margin: "0 8px" }}
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            autoComplete="off"
          />
          {errors.email && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.email}</span>
          )}
        </label>
        <label>
          Start:
          <DatePicker
            selected={form.start}
            onChange={date => setForm({ ...form, start: date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={new Date()}
            required
            style={{ marginLeft: 4, marginRight: 8 }}
          />
          {errors.start && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.start}</span>
          )}
        </label>
        <label>
          End:
          <DatePicker
            selected={form.end}
            onChange={date => setForm({ ...form, end: date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={form.start}
            required
          />
          {errors.end && (
            <span style={{ color: "red", fontSize: 12 }}>{errors.end}</span>
          )}
        </label>
      </form>
      {emptySlots.length === 0 && <p>No available slots for reservation.</p>}
      <ul>
        {emptySlots.map(slot => (
          <li key={slot.detection_id} style={{ marginBottom: 6 }}>
            Slot ID: {slot.detection_id}
            {reserved.includes(slot.detection_id) ? (
              <span style={{ marginLeft: 8, color: "green" }}>Reserved</span>
            ) : (
              <button
                style={{ marginLeft: 8 }}
                disabled={
                  !form.name ||
                  !form.email ||
                  !form.start ||
                  !form.end ||
                  reserved.includes(slot.detection_id) ||
                  form.end <= form.start
                }
                onClick={() => handleReserve(slot)}
              >
                Reserve
              </button>
            )}
          </li>
        ))}
      </ul>
      {confirmation && (
        <div style={{ marginTop: 12, color: "blue" }}>
          <b>{confirmation}</b>
        </div>
      )}
    </div>
  );
}
