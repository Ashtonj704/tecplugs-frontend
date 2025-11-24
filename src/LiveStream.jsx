import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://tecplugs-backend.onrender.com";

export default function LiveStream() {
  const [socket, setSocket] = useState(null);
  const [role, setRole] = useState(null); // "streamer" or "viewer"
  const [status, setStatus] = useState("Not connected");
  const [remoteSocketId, setRemoteSocketId] = useState("");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  // connect socket
  useEffect(() => {
    const s = io(SOCKET_URL, { withCredentials: true });
    setSocket(s);

    s.on("connect", () => {
      setStatus("Socket connected. Your id: " + s.id);
    });

    // when we receive an offer (viewer side)
    s.on("webrtc-offer", async ({ from, offer }) => {
      setStatus("Got offer from streamer, creating answer…");
      await createPeerConnection();

      // set remote
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));

      // create answer
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      // send answer back
      s.emit("webrtc-answer", { to: from, answer });

      // remember who we're talking to
      setRemoteSocketId(from);
    });

    // when we receive an answer (streamer side)
    s.on("webrtc-answer", async ({ from, answer }) => {
      setStatus("Got answer from viewer, connection should establish…");
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // ICE from the other side
    s.on("webrtc-ice", async ({ from, candidate }) => {
      if (pcRef.current && candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE", err);
        }
      }
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const createPeerConnection = async () => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && remoteSocketId && socket) {
        socket.emit("webrtc-ice", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      // remote stream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play();
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const startAsStreamer = async () => {
    if (!socket) return;
    setRole("streamer");
    setStatus("Requesting camera…");
    // get stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      localVideoRef.current.play();
    }
    setStatus("Streamer ready. Ask viewer for socket id.");
  };

  const startAsViewer = () => {
    if (!socket) return;
    setRole("viewer");
    setStatus("Viewer ready. Tell streamer your socket id below.");
  };

  // streamer clicks this AFTER pasting viewer socket id
  const callViewer = async () => {
    if (!socket) return;
    if (!remoteSocketId) {
      setStatus("Paste viewer socket id first.");
      return;
    }
    if (!localStreamRef.current) {
      setStatus("No local stream yet.");
      return;
    }

    await createPeerConnection();

    // add our tracks
    localStreamRef.current.getTracks().forEach((track) => {
      pcRef.current.addTrack(track, localStreamRef.current);
    });

    // create offer
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    // send to viewer
    socket.emit("webrtc-offer", {
      to: remoteSocketId,
      offer,
    });

    setStatus("Offer sent to viewer…");
  };

  const stopStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setStatus("Stopped.");
  };

  return (
    <div style={{ marginTop: "1.5rem", padding: 12, border: "1px solid #ddd", borderRadius: 6 }}>
      <h3>Live Stream (WebRTC demo)</h3>
      <p style={{ fontSize: 12, marginBottom: 6 }}>{status}</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={startAsStreamer}>I’m the streamer</button>
        <button onClick={startAsViewer}>I’m the viewer</button>
        <button onClick={stopStream}>Stop</button>
      </div>

      {role === "streamer" && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 12 }}>
            Ask the viewer for their socket id and paste it here:
          </p>
          <input
            value={remoteSocketId}
            onChange={(e) => setRemoteSocketId(e.target.value)}
            placeholder="viewer socket id"
            style={{ width: "100%", padding: 6, marginBottom: 6 }}
          />
          <button onClick={callViewer}>Call viewer</button>
        </div>
      )}

      {socket && (
        <p style={{ fontSize: 11, marginBottom: 8 }}>
          Your socket id: <code>{socket.id}</code>
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <p style={{ fontSize: 12 }}>Your video</p>
          <video
            ref={localVideoRef}
            style={{ width: "100%", background: "#000", borderRadius: 6 }}
            playsInline
          />
        </div>
        <div>
          <p style={{ fontSize: 12 }}>Remote video</p>
          <video
            ref={remoteVideoRef}
            style={{ width: "100%", background: "#000", borderRadius: 6 }}
            playsInline
          />
        </div>
      </div>
    </div>
  );
}

