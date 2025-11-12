"use client";

import { useState } from "react";

export default function RegisterNode() {
  const [nodeUrl, setNodeUrl] = useState("");

  const handleRegisterNode = () => {
    // Handle node registration
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Register Node</h2>
      <input
        type="text"
        value={nodeUrl}
        onChange={(e) => setNodeUrl(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Enter your node URL"
      />
      <button onClick={handleRegisterNode} className="p-2 bg-blue-500 text-white rounded">
        Register
      </button>
    </div>
  );
}