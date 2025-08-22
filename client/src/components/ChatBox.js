"use client";
import { useState } from "react";
import axios from "axios";

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState([]);

  const handleSend = async () => {
    if (!message) return;
    const res = await axios.post("/api/telemedicine", { query: message });
    setResponses([...responses, { user: message, bot: res.data.answer }]);
    setMessage("");
  };

  return (
    <div className="p-4 border rounded-lg w-full max-w-md mx-auto bg-white shadow">
      <div className="h-64 overflow-y-auto mb-2">
        {responses.map((r, i) => (
          <div key={i} className="mb-2">
            <p><b>You:</b> {r.user}</p>
            <p className="text-blue-600"><b>Doctor:</b> {r.bot}</p>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border flex-1 p-2 rounded-l"
          placeholder="Ask your question..."
        />
        <button onClick={handleSend} className="bg-blue-600 text-white px-4 rounded-r">
          Send
        </button>
      </div>
    </div>
  );
}
