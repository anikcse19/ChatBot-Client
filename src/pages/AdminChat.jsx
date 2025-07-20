// AdminChat.jsx
import React, { useEffect, useState } from "react";
import {
  adminReply,
  getAllConversation,
  getConversation,
  makeAdminActive,
} from "../api/api";
import ChatBox from "../component/ChatBox";
import socket from "../socket";

// const sessionId = "256da8449cc9e4a0e8720ecb70a886fd"; // Should be dynamic in production

const AdminChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [isActive, setIsActive] = useState(false);

  const handleToggle = async () => {
    const data = {
      adminId: "687b5069f064139f955063c2",
      isOnline: !isActive,
    };

    try {
      const res = await makeAdminActive(data);
      if (res.status === 200 && res.data.message === "Admin status updated") {
        setIsActive(!isActive);
        console.log("Status updated successfully:", res.data.message);
      } else {
        console.warn("Unexpected response:", res);
      }
    } catch (err) {
      console.error("Error updating admin status:", err);
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await getAllConversation();
        setConversations(res.data.conversation);
      } catch (err) {
        console.error("Error loading conversations:", err);
      }
    };

    fetchConversations();
  }, []);
  console.log("get all conversation", conversations);
  const handleSelectSession = async (sessionId) => {
    if (isActive) {
      try {
        const data = {
          adminId: "687b5069f064139f955063c2",
          isOnline: false,
        };
        const res = await makeAdminActive(data);
        if (res.status === 200 && res.data.message === "Admin status updated") {
          setIsActive(false);
          console.log("Admin set to offline before switching session");
        }
      } catch (err) {
        console.error("Failed to set admin offline:", err);
      }
    }
    setSessionId(sessionId);
    console.log("Selected Session ID:", sessionId);
    // You can now fetch messages or update UI
  };

  // Handle admin reply
  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const adminMsg = {
        sender: "admin",
        text: message,
        timestamp: new Date(),
      };

      // Send message to backend (no need to store response)
      await adminReply({
        sessionId,
        message: adminMsg,
      });

      // Update chat UI
      setMessages((prev) => [...prev, adminMsg]);

      // Emit to socket (optional, backend might already do this)
      socket.emit("admin-reply", {
        sessionId,
        text: message,
      });
      console.log("admin msg", message);
      setMessage("");
    } catch (error) {
      console.error("Error sending admin reply:", error);
    }
  };

  // Fetch initial conversation and set up socket listener
  useEffect(() => {
    // Load existing conversation
    getConversation(sessionId).then((res) => {
      if (res.data.conversation) {
        setMessages(res.data.conversation.messages);
      }
    });

    // Listen for messages from the user
    socket.on("user-message", (data) => {
      console.log("Received in admin:", data);
      if (data.sessionId === sessionId) {
        setMessages((prev) => [
          ...prev,
          { sender: "user", text: data.message },
        ]);
      }
    });
    socket.on("bot_reply", (data) => {
      console.log("Received in bot:", data);
      console.log("Received in bot:", data.message);
      if (data.sessionId === sessionId) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.message }]);
      }
    });
    // Join socket room for session
    socket.emit("join", sessionId);

    return () => {
      socket.off("user-message");
      socket.off("bot_reply");
    };
  }, [sessionId]);
  return (
    <div className="max-w-4xl py-24 mx-auto">
      <div className=" flex border p-12">
        <div className=" w-1/3 p-8 bg-amber-100">
          <h2 className=" text-2xl font-bold pb-5">
            All users {conversations.length}{" "}
          </h2>
          <div>
            {" "}
            {conversations.map((conv) => (
              <div
                onClick={() => handleSelectSession(conv.sessionId)}
                key={conv.sessionId}
                className=" bg-gray-200 hover:bg-blue-100 p-2 rounded-lg text-center flex mb-5 text-lg font-semibold uppercase cursor-pointer"
              >
                <h2 className=" text-center"> {conv.userName} </h2>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-blue-100 w-2/3 p-8">
          <div className=" flex items-center">
            <h2 className=" text-2xl font-bold  pb-5">Admin Chat</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggle}
                className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ${
                  isActive ? "bg-emerald-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                    isActive ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </button>
              <span className="text-sm font-medium">
                {isActive ? "Active" : "Offline"}
              </span>
            </div>
          </div>

          <div className=" border border-gray-300 rounded-lg">
            {/* Chat UI */}
            <ChatBox messages={messages} currentUser="admin" />

            {/* Input */}
            <div
              className=" border"
              style={{ marginTop: "1rem", display: "flex" }}
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ flex: 1, padding: "8px" }}
                placeholder="Type admin reply..."
              />
              <button
                onClick={handleSend}
                disabled={!isActive}
                className={`text-white ${
                  isActive ? "bg-blue-500" : "bg-gray-400 cursor-not-allowed"
                }`}
                style={{ padding: "8px 16px" }}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
