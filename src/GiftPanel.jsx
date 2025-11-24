// frontend/src/GiftPanel.jsx
import { useState } from "react";

export default function GiftPanel({ onGiftSent }) {
  const [toUsername, setToUsername] = useState("");
  const [amount, setAmount] = useState(10);
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    const token = localStorage.getItem("theplug_token");
    if (!token) {
      setMessage("You must be logged in.");
      return;
    }

    try {
      const res = await fetch("https://tecplugs-backend.onrender.com/api/gifts/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          toUsername,
          amount: Number(amount),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Gift failed");
      } else {
        setMessage("🎁 Gift sent!");
        setToUsername("");
        if (onGiftSent) onGiftSent();
      }
    } catch (err) {
      console.error(err);
      setMessage("Could not reach server");
    }
  };

  return (
    <div style={{ marginTop: "1.5rem", padding: 12, border: "1px solid #ddd", borderRadius: 6 }}>
      <h3>Send a Gift</h3>
      <input
        value={toUsername}
        onChange={(e) => setToUsername(e.target.value)}
        placeholder="recipient username"
        style={{ width: "100%", padding: 6, marginBottom: 6 }}
      />
      <select
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", padding: 6, marginBottom: 6 }}
      >
        <option value={10}>💎 10</option>
        <option value={25}>🌹 25</option>
        <option value={50}>🚀 50</option>
        <option value={100}>👑 100</option>
      </select>
      <button onClick={handleSend} style={{ width: "100%", padding: 6 }}>
        Send Gift
      </button>
      {message && <p style={{ marginTop: 6 }}>{message}</p>}
    </div>
  );
}
