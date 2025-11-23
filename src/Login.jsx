import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed");
        return;
      }

      setMessage("✅ Logged in!");
      setToken(data.token);

      localStorage.setItem("theplug_token", data.token);
      localStorage.setItem("theplug_username", data.username);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Could not reach server.");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Register failed");
        return;
      }

      setMessage("✅ Account created — now log in.");
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Could not reach server.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: "1rem" }}>The Plug – Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <button
          type="submit"
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        >
          Log in
        </button>
      </form>

      <button
        onClick={handleRegister}
        style={{ width: "100%", padding: 10, marginBottom: 8 }}
      >
        Create account
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}

      {token && (
        <p style={{ marginTop: 10, fontSize: 12 }}>
          Token saved. You can use this to call protected routes.
        </p>
      )}
    </div>
  );
}

