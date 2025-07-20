import React from "react";

const ChatBox = ({ messages }) => {
  console.log("messeage = ",messages)
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
      {messages.map((msg, i) => (
        <div key={i} style={{ marginBottom: "0.5rem" }}>
          <strong>{msg.sender}: </strong> {msg.text}
        </div>
      ))}
    </div>
  );
};

export default ChatBox;
