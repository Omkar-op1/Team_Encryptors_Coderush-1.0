"use client";
import { Globe, Settings, Video } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Left: Logo + Name */}
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 text-white rounded-full p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-800">HealthAssist AI</h1>
          <p className="text-sm text-gray-500">Virtual Healthcare for Remote Areas</p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-4">
        <button className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-100 transition">
          <Globe className="w-4 h-4" /> English
        </button>
        <button className="flex items-center gap-1 bg-blue-600 text-white rounded-lg px-3 py-1 hover:bg-blue-700 transition">
          <Video className="w-4 h-4" /> Telemedicine
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </nav>
  );
}
