"use client";

import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    // Handle sending message to the AI model
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Chat messages will be displayed here */}
      </div>
      <div className="p-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} className="mt-2 p-2 bg-blue-500 text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
}