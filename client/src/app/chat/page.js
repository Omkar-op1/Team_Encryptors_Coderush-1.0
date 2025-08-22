"use client";
import { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import Navbar from "../Navbar";

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your virtual doctor assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [sessionId] = useState(() => crypto.randomUUID() || Date.now().toString());
  const userId = "user124";
  const API_URL = "http://localhost:5000";

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setInput("");

    try {
      const res = await fetch(`${API_URL}/api/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId, text: textToSend }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API request failed: ${res.status} ${res.statusText} - ${errorText}`);
      }

      const data = await res.json();
      if (!data.response) {
        throw new Error("Invalid response format from server");
      }
      setMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
    } catch (error) {
      console.error("Fetch error details:", {
        message: error.message,
        stack: error.stack,
        url: `${API_URL}/api/message`,
        requestBody: { sessionId, userId, text: textToSend },
      });
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Sorry, there was an error: ${error.message}` },
      ]);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", blob, "audio.webm");

          try {
            const res = await fetch(`${API_URL}/transcribe`, {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`Transcription failed: ${res.status} ${res.statusText} - ${errorText}`);
            }

            const { text } = await res.json();
            if (text) {
              handleSend(text);
            } else {
              throw new Error("No transcription text received");
            }
          } catch (error) {
            console.error("Transcription error details:", {
              message: error.message,
              stack: error.stack,
              url: `${API_URL}/transcribe`,
            });
            setMessages((prev) => [
              ...prev,
              { sender: "bot", text: `Sorry, there was an error transcribing your audio: ${error.message}` },
            ]);
          }
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Error accessing microphone. Please check permissions." },
        ]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col items-center flex-1 p-6 pt-28 w-full">
        {/* Heading */}
        <h1 className="text-4xl font-bold mb-8 text-blue-800">Chat with Virtual Doctor</h1>

        {/* Chat Container */}
        <div className="w-full max-w-4xl flex-1 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden min-h-[600px]">
          
          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-4 rounded-xl max-w-[80%] break-words ${
                    msg.sender === "bot"
                      ? "bg-blue-100 text-blue-800 rounded-tl-sm"
                      : "bg-green-500 text-white rounded-tr-sm"
                  }`}
                >
                  <div className="text-base leading-relaxed">{msg.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50 flex gap-3">
            <input
              type="text"
              className="flex-1 border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={toggleRecording}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isRecording 
                  ? "bg-red-600 text-white hover:bg-red-700 shadow-lg" 
                  : "bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg"
              }`}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              {isRecording ? "Stop" : "Mic"}
            </button>
            <button
              onClick={() => handleSend()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}