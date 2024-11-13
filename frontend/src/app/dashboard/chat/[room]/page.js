"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

const ChatRoom = () => {
  const router = useRouter();
  const { roomName } = useParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (roomName) {
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/`);
      setSocket(ws);

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setMessages((prevMessages) => [...prevMessages, data.message]);
      };

      ws.onclose = (e) => {
        console.error("Chat socket closed unexpectedly");
      };

      return () => {
        ws.close();
      };
    }
  }, [roomName]);

  const handleSendMessage = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          message: message,
        })
      );
      setMessage("");
    }
  };

  return (
    <div>
      <h1>Chat Room: {roomName}</h1>
      <div id="chat-log">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        id="chat-message-input"
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            handleSendMessage();
          }
        }}
      />
      <button id="chat-message-submit" onClick={handleSendMessage}>
        Send
      </button>
    </div>
  );
};

export default ChatRoom;
