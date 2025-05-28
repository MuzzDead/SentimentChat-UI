"use client";

import { useState, useEffect } from "react";

export default function UsernamePopup({ onUsernameSet }) {
  const [name, setName] = useState("");
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const savedName = sessionStorage.getItem("username");
    if (savedName) {
      setShowPopup(false);
      onUsernameSet(savedName);
    }
  }, []);

  const handleSubmit = () => {
    if (name.trim()) {
      sessionStorage.setItem("username", name.trim());
      setShowPopup(false);
      onUsernameSet(name.trim());
    }
  };

  if (!showPopup) return null;

  return (
    <div style={overlayStyle}>
      <div style={popupStyle}>
        <h2>Input your name:</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          placeholder="Ваше ім’я"
        />
        <button onClick={handleSubmit} style={buttonStyle}>
          Save
        </button>
      </div>
    </div>
  );
}

// Стили
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const popupStyle = {
  background: "white",
  padding: "2rem",
  borderRadius: "12px",
  textAlign: "center",
  width: "90%",
  maxWidth: "400px",
};

const inputStyle = {
  padding: "0.5rem",
  width: "100%",
  marginBottom: "1rem",
};

const buttonStyle = {
  padding: "0.5rem 1rem",
  backgroundColor: "#0D92F4",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
