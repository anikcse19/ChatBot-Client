const ChatBox = ({ messages, currentUser }) => {
  return (
    <div
      style={{
        maxHeight: "400px",
        overflowY: "auto",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        position: "relative",
      }}
    >
      {messages.map((msg, i) => {
        const isStatusMessage =
          msg.text === "Admin is online" || msg.text === "Admin is offline";

        if (isStatusMessage) {
          return (
            <div
              key={`status-${i}`}
              style={{
                textAlign: "center",
                margin: "10px 0",
                fontWeight: "medium",
                color: msg.text === "Admin is online" ? "green" : "red",
              }}
            >
              {msg.text}
            </div>
          );
        }

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
              position: "relative",
              zIndex: 0,
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
