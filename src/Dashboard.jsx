// frontend/src/Dashboard.jsx
import LiveStream from "./LiveStream";
import { useEffect, useState } from "react";
import Chat from "./Chat";
import GiftPanel from "./GiftPanel";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  const loadMe = () => {
    const token = localStorage.getItem("theplug_token");
    if (!token) {
      setError("Not logged in");
      return;
    }

    fetch("http://tecplugs-backend.onrender.com/api/auth/me", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setMe(data);
          localStorage.setItem("theplug_username", data.username);
          setError("");
        }
      })
      .catch(() => setError("Could not reach server"));
  };

  useEffect(() => {
    loadMe();
  }, []);

  if (error) {
    return (
      <div style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "system-ui" }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "system-ui" }}>
        <p>Loading your account…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "system-ui" }}> <button
  onClick={() => {
    localStorage.clear();
    window.location.reload();
  }}
  style={{ marginBottom: "1rem", padding: "6px 10px" }}
>
  Log Out
</button>

      <h2 style={{ marginBottom: "1rem" }}>The Plug – Dashboard</h2>
      <p>
        Welcome, <b>@{me.username}</b>
      </p>
      <p>
        Your coins: <b>{me.coins}</b>
      </p>
      <p>
        Your earnings: <b>{me.earnings}</b>
      </p>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: 8 }}>
        <button style={{ padding: "8px 12px" }}>Open Chat</button>
        <button style={{ padding: "8px 12px" }}>Go Live</button>
        <button style={{ padding: "8px 12px" }}>Send Gifts</button>
      </div>

      {/* chat */}
      <Chat />

      <Chat />

      <LiveStream />

      <GiftPanel onGiftSent={loadMe} />


      {/* gifts */}
      <GiftPanel onGiftSent={loadMe} />
    </div>
  );
}

