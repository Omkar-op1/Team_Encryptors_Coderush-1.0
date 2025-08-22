"use client";
import { useState, useRef } from "react";
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
      <Navbar />
      <div className="flex flex-col items-center flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Chat with Virtual Doctor</h1>
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
          <div className="p-2 border-t flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={toggleRecording}
              className={`px-4 py-2 rounded-lg transition ${
                isRecording ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {isRecording ? "Stop" : "Mic"}
            </button>
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