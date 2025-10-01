
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import axios from "axios";

const ROBOFLOW_API_URL = "https://serverless.roboflow.com";
const MODEL_ID = "smart-parking-management-wzern/1";
const API_KEY = "PGrIpZKv33UKyE1zf032";

const ParkingDetection = forwardRef(({ onDetect }, ref) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Expose handleFileUpload to parent via ref
  useImperativeHandle(ref, () => ({
    handleFileUpload(file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  }));

  // Normal user uploads
  const handleFileChange = e => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
      setResult(null);
    }
  };

  // Run detection on current file in state
  const handleDetect = async () => {
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);
    try {
      const { data } = await axios.post(
        `${ROBOFLOW_API_URL}/${MODEL_ID}?api_key=${API_KEY}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(data);
      onDetect && onDetect(data.predictions);
    } catch (err) {
      console.error(err);
      alert("Detection failed, try again.");
    } finally {
      setLoading(false);
    }
  };

  // Draw image and bounding boxes on canvas
  useEffect(() => {
    if (!preview || !result) return;
    const img = new window.Image();
    img.src = preview;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = 480;
      canvas.height = (img.height / img.width) * 480;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const xScale = canvas.width / img.width;
      const yScale = canvas.height / img.height;

      result.predictions.forEach(p => {
        ctx.strokeStyle = p.class === "empty" ? "green" : "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x * xScale, p.y * yScale, p.width * xScale, p.height * yScale);
        ctx.fillStyle = "rgba(255,255,0,0.7)";
        ctx.font = "13px Arial";
        ctx.fillText(
          p.class,
          p.x * xScale,
          p.y * yScale > 15 ? p.y * yScale - 7 : 15
        );
      });
    };
  }, [preview, result]);

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <div style={{ display: "flex", gap: 15, marginBottom: 15 }}>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: "none" }} 
        />
        <button onClick={() => fileInputRef.current.click()}>
          Choose File
        </button>
        <button onClick={handleDetect} disabled={!image || loading}>
          {loading ? "Detecting..." : "Detect Parking"}
        </button>
        <button
          onClick={() => {
            setImage(null);
            setPreview("");
            setResult(null);
          }}
          disabled={loading || (!image && !preview)}
        >
          Clear
        </button>
      </div>
      <div
        style={{
          border: "1px solid #ddd",
          minHeight: 300,
          minWidth: 480,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa"
        }}
      >
        {preview ? (
          <canvas ref={canvasRef} style={{ width: 480, height: "auto" }} />
        ) : (
          <span style={{ color: "#aaa" }}>Image/Result will appear here</span>
        )}
      </div>
    </div>
  );
}); 

export default ParkingDetection;
