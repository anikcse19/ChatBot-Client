// UserChat.jsx
import React, { useEffect, useState } from "react";
import {  getConversation, getSingleUser, sendMessage } from "../api/api";
import socket from "../socket";
import ChatBox from "../component/ChatBox";
import { useParams } from "react-router";


// const sessionId = "256da8449cc9e4a0e8720ecb70a886fd"; // This should be dynamic
// const userId = "687b4d13f064139f95506362";

// const sessionId = "0614d0e3548f367e54af11dba5ac3b49"; // This should be dynamic
// const userId = "687b4c8bf064139f95506356";
const UserChat = () => {
  const { id } = useParams();
  console.log(" id =", id);
  const userId = id;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState([]);
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

    if (res.data.status === "bot_replied") {
      setMessages((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
    }

    setMessage("");
  };

  useEffect(() => {
    getConversation(sessionId).then((res) => {
      if (res.data.conversation) {
        setMessages(res.data.conversation.messages);
      }
    });
    console.log(" from user ");
    socket.on("admin-reply", (data) => {
      console.log("admin reply =", data);
      if (data.sessionId === sessionId) {
        setMessages((prev) => [...prev, { sender: "admin", text: data.text }]);
      }
    });
    socket.emit("join", sessionId);

    return () => socket.off("admin-reply");
  }, [sessionId]);

  return (
    <div className="max-w-4xl py-24 mx-auto">
      <div className="w-[600px]">
        <h2 className=" text-2xl font-bold  pb-5">User Chat</h2>
        <div className=" border border-gray-300 rounded-lg">
          <ChatBox messages={messages} />
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
          {/* <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: "80%", marginTop: "1rem" }}
            placeholder="Type a message..."
          />
          <button onClick={handleSend}>Send</button> */}
        </div>
      </div>
    </div>
  );
};

export default UserChat;
