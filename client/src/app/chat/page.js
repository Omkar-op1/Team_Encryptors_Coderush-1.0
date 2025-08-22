"use client";
import { useState } from "react";
import Navbar from "../Navbar";
import { Mic } from "lucide-react"; // ✅ mic icon

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your virtual doctor assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);

  const handleSend = (text = input) => {
    if (!text.trim()) return;

    setMessages([...messages, { sender: "user", text }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thanks for your message. A doctor will review it shortly." },
      ]);
    }, 1000);
  };

  const handleMicClick = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* ✅ Navbar at the top */}
      <Navbar />

      <div className="flex flex-col items-center flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">
          Chat with Virtual Doctor
        </h1>
        <div className="w-full max-w-md flex-1 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg ${
                  msg.sender === "bot"
                    ? "bg-blue-100 text-blue-800 self-start"
                    : "bg-gray-200 self-end"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex gap-2 items-center">
            <input
              type="text"
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            {/* ✅ Mic button */}
            <button
              onClick={handleMicClick}
              className={`w-12 h-12 flex items-center justify-center rounded-full ${
                listening ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
              } shadow-md transition`}
            >
              <Mic size={20} />
            </button>
            {/* ✅ Send button */}
            <button
              onClick={() => handleSend()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
