// AdminChat.jsx
import React, { useEffect, useState } from "react";
import {
  adminReply,
  // getAdminStatus,
  getAllConversation,
  getConversation,
  makeAdminActive,
} from "../api/api";
import ChatBox from "../component/ChatBox";
import socket from "../socket";

const AdminChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  // const [isActive, setIsActive] = useState();
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch admin status on mount
  // useEffect(() => {
  //   const fetchStatus = async () => {
  //     try {
  //       const res = await getAdminStatus();
  //       if (res.status === 200) {
  //         setIsActive(res.data.isOnline);
  //         console.log("Admin status:", res.data.isOnline);
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch admin status:", err);
  //     }
  //   };
  //   fetchStatus();
  // }, []);

  // Fetch all conversations
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

  // Select session
  const handleSelectSession = async (sessionId) => {
    const selected = conversations.find((conv) => conv.sessionId === sessionId);
    setSelectedSession(selected);

    // Load conversation messages
    try {
      const res = await getConversation(sessionId);
      if (res.data.conversation) {
        setMessages(res.data.conversation.messages);
      }
    } catch (err) {
      console.error("Error loading conversation:", err);
    }

    // Emit admin joined
    socket.emit("admin-status", {
      sessionId,
      isActive: true,
    });
  };

  // Handle toggle
  const handleToggle = async (sessionId, newStatus) => {
    try {
      const res = await makeAdminActive({
        sessionId,
        isAdminOnline: newStatus,
      });

      if (res.status === 200) {
        const updated = conversations.map((conv) =>
          conv.sessionId === sessionId
            ? { ...conv, isAdminOnline: newStatus }
            : conv
        );
        setConversations(updated);
        setSelectedSession((prev) => ({
          ...prev,
          isAdminOnline: newStatus,
        }));

        socket.emit("admin-status", {
          sessionId,
          isActive: newStatus,
        });
      }
    } catch (error) {
      console.error("Toggle failed", error);
    }
  };

  // Handle sending admin message
  const handleSend = async () => {
    if (!message.trim() || !selectedSession) return;

    const sessionId = selectedSession.sessionId;

    try {
      const adminMsg = {
        sender: "admin",
        text: message,
        timestamp: new Date(),
      };

      await adminReply({ sessionId, message: adminMsg });

      setMessages((prev) => [...prev, adminMsg]);

      socket.emit("admin-reply", {
        sessionId,
        text: message,
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending admin reply:", error);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!selectedSession?.sessionId) return;

    const sessionId = selectedSession.sessionId;

    const handleUserMsg = (data) => {
      if (data.sessionId === sessionId) {
        setMessages((prev) => [
          ...prev,
          { sender: "user", text: data.message },
        ]);
      }
    };

    const handleBotReply = (data) => {
      if (data.sessionId === sessionId) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.message }]);
      }
    };

    socket.on("user-message", handleUserMsg);
    socket.on("bot_reply", handleBotReply);
    socket.emit("join", sessionId);
    return () => {
      socket.off("user-message", handleUserMsg);
      socket.off("bot_reply", handleBotReply);
    };
  }, [selectedSession?.sessionId]);

  return (
    <div className="max-w-4xl py-24 mx-auto">
      <div className="flex border p-12">
        {/* User list */}
        <div className="w-1/3 p-8 bg-amber-100">
          <h2 className="text-2xl font-bold pb-5">
            All users {conversations.length}
          </h2>
          {conversations.map((conv) => (
            <div
              onClick={() => handleSelectSession(conv.sessionId)}
              key={conv.sessionId}
              className="bg-gray-200 hover:bg-blue-100 p-2 rounded-lg text-center flex mb-5 text-lg font-semibold uppercase cursor-pointer"
            >
              <h2 className="text-center flex-1">{conv.userName}</h2>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="bg-blue-100 w-2/3 p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold">Admin Chat</h2>

            {selectedSession && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() =>
                    handleToggle(
                      selectedSession.sessionId,
                      !selectedSession.isAdminOnline
                    )
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ${
                    selectedSession.isAdminOnline
                      ? "bg-emerald-600"
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                      selectedSession.isAdminOnline
                        ? "translate-x-6"
                        : "translate-x-0"
                    }`}
                  ></div>
                </button>
                <span className="text-sm font-medium">
                  {selectedSession.isAdminOnline ? "Active" : "Offline"}
                </span>
              </div>
            )}
          </div>

          <div className="border border-gray-300 rounded-lg">
            {selectedSession ? (
              <>
                <ChatBox messages={messages} currentUser="admin" />
                <div className="border mt-4 flex">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ flex: 1, padding: "8px" }}
                    placeholder="Type admin reply..."
                  />
                  <button
                    onClick={handleSend}
                    disabled={!selectedSession.isAdminOnline}
                    className={`text-white ${
                      selectedSession.isAdminOnline
                        ? "bg-blue-500"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    style={{ padding: "8px 16px" }}
                  >
                    Reply
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center p-8 text-gray-600">
                Select a user to start chatting.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
