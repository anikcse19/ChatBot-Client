// components/Chat.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";

const Chat = () => {
  const [sessionId, setSessionId] = useState("abc123");
  const [userId, setUserId] = useState("user123");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Join socket room using sessionId
    socket.emit("join", sessionId);

    // Listen for bot reply
    socket.on("bot_reply", (data) => {
      appendMessage("bot", data.message.text);
    });

    // Listen for admin reply (if any)
    socket.on("admin_reply", (data) => {
      appendMessage("admin", data.message.text);
    });

    return () => {
      socket.off("bot_reply");
      socket.off("admin_reply");
    };
  }, [sessionId]);

  const appendMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    // Append user's message
    appendMessage("user", message);

    // Send message via REST API
    try {
      await axios.post("http://localhost:5000/api/conversation/message", {
        userId,
        sessionId,
        message,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setMessage("");
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto" }}>
      <h2>Real-time Chat</h2>

      <div>
        <input
          placeholder="Session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          style={{ width: "48%", marginRight: "4%" }}
        />
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ width: "48%" }}
        />
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          marginTop: 20,
          padding: 10,
          height: 300,
          overflowY: "auto",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 10 }}>
            <strong style={{ color: getColor(msg.sender) }}>
              {msg.sender.toUpperCase()}:
            </strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          style={{ width: "80%", padding: "8px" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} style={{ padding: "8px 12px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

const getColor = (sender) => {
  switch (sender) {
    case "user":
      return "blue";
    case "bot":
      return "green";
    case "admin":
      return "darkred";
    default:
      return "black";
  }
};

export default Chat;
