// UserChat.jsx
import React, { useEffect, useState } from "react";
import { getConversation, getSingleUser, sendMessage } from "../api/api";
import socket from "../socket";
import ChatBox from "../component/ChatBox";
import { useParams } from "react-router";
const UserChat = () => {
  const { id } = useParams();
  console.log(" id =", id);
  const userId = id;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState([]);
  // const [adminActive, setAdminActive] = useState(false);
  console.log("sessionId=", sessionId);
  useEffect(() => {
    // Load existing conversation
    getSingleUser(id).then((res) => {
      if (res.data.user) {
        setSessionId(res.data.user.sessionId);
      }
    });
  }, [id]);
  const handleSend = async () => {
    if (!message) return;

    const res = await sendMessage({ sessionId, userId, message });
    setMessages((prev) => [...prev, { sender: "user", text: message }]);
    //       if (res.data.status === "waiting_for_admin") {
    //       setAdminActive(true)
    //       }
    // console.log(" user resonse data ",res.data)
    if (res.data.status === "bot_replied") {
      setMessages((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
    }

    setMessage("");
  };

  useEffect(() => {
    if (!sessionId) return;
    getConversation(sessionId).then((res) => {
      if (res.data.conversation) {
        setMessages(res.data.conversation.messages);
   
      }
    });

    socket.emit("join", sessionId);
    socket.on("admin-reply", (data) => {
      if (data.sessionId === sessionId) {
     
          setMessages((prev) => [
            ...prev,
            { sender: "admin", text: data.text },
          ]);
        }
      
    });
    // 👇 Add the "admin-status" listener here
    socket.on("admin-status", (data) => {
      console.log("Admin status changed:", data.message);
      // Optional: Show a message in chat or toast
      setMessages((prev) => [...prev, { type: "status", text: data.message }]);
    
    });
    return () => {
      socket.off("admin-reply"), socket.off("admin-status");
    };
  }, [sessionId]);

  return (
    <div className="max-w-4xl py-24 mx-auto">
      <div className="w-[600px]">
        <h2 className=" text-2xl font-bold  pb-5">User Chat</h2>
        <div className=" border border-gray-300 rounded-lg">
          <ChatBox
            messages={messages}
            // isAdminOnline={adminActive}
            currentUser="user"
          />

          <div
            className=" border"
            style={{ marginTop: "1rem", display: "flex" }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ flex: 1, padding: "8px" }}
              placeholder="Type a message..."
            />
            <button
              onClick={handleSend}
              className=" bg-blue-500 text-white"
              style={{ padding: "8px 16px" }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChat;
