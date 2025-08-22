"use client";
import Link from "next/link";
import { Globe, Settings, Video } from "lucide-react";


export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Left: Logo + Name */}
      <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition">
        <div className="bg-blue-600 text-white rounded-full p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-stethoscope h-6 w-6 text-primary-foreground"
            aria-hidden="true"
          >
            <path d="M11 2v2"></path>
            <path d="M5 2v2"></path>
            <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"></path>
            <path d="M8 15a6 6 0 0 0 12 0v-3"></path>
            <circle cx="20" cy="10" r="2"></circle>
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-800">HealthAssist AI</h1>
          <p className="text-sm text-gray-500">Virtual Healthcare for Remote Areas</p>
        </div>
      </Link>

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
