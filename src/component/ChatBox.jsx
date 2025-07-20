import React from "react";

const ChatBox = ({ messages, currentUser }) => {
  return (
    <div
      style={{
        maxHeight: "400px",
        overflowY: "auto",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      {messages.map((msg, i) => {
        const isOwnMessage =
          currentUser === "user"
            ? msg.sender === "user"
            : msg.sender === "admin" || msg.sender === "bot";

        return (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: isOwnMessage ? "flex-end" : "flex-start",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                backgroundColor: isOwnMessage ? "#e0f7fa" : "#dcedc8",
                padding: "8px 12px",
                borderRadius: "16px",
                maxWidth: "70%",
              }}
            >
              <strong>{msg.sender}</strong>: {msg.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatBox;
