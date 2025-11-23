// frontend/src/Chat.jsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001";

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const s = io(SOCKET_URL, { withCredentials: true });
    setSocket(s);

    s.on("chat", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    const username = localStorage.getItem("theplug_username") || "anon";
    const fullMsg = `${username}: ${input}`;
    socket.emit("chat", fullMsg);
    setInput("");
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h3>Live Chat</h3>
      <div
        style={{
          border: "1px solid #ccc",
          height: 200,
          overflowY: "auto",
          padding: 8,
          borderRadius: 6,
          background: "#fafafa",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            {m}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ flex: 1, padding: 6 }}
          placeholder="say something..."
        />
        <button onClick={sendMessage} style={{ padding: "6px 12px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

