"use client";

import { useState } from "react";
import {
  Video,
  Mic,
  MicOff,
  PhoneOff,
  User,
  Star,
  Stethoscope,
  Clock,
  MapPin,
  FileText,
  Shield,
} from "lucide-react";

export default function Telemedicine() {
  const [micOn, setMicOn] = useState(true);

  // Example doctor + consultation details
  const selectedDoctor = {
    name: "Dr. Priya Sharma",
    specialization: "General Medicine",
    qualification: "MBBS, MD (Internal Medicine)",
    experience: 12,
    rating: 4.8,
    reviewCount: 245,
    hospitalAffiliation: "AIIMS Delhi",
    consultationFee: 500,
    ayushmanEmpanelled: true,
  };

  const appointmentDetails = {
    date: "22 Aug 2025",
    time: "10:30 AM",
    type: "Video Consultation",
    reason: "Fever and headache",
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-semibold">Telemedicine Consultation</h1>
        <p className="text-sm opacity-90">HealthAssist AI</p>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 flex items-center justify-center bg-black text-white relative">
          {/* Patient Video */}
          <div className="w-4/5 h-4/5 bg-gray-800 flex flex-col items-center justify-center rounded-xl shadow-lg">
            <Video className="w-12 h-12 opacity-50" />
            <span className="mt-2 text-gray-400">Patient Video</span>
          </div>

          {/* Doctor Preview */}
          <div className="absolute bottom-4 right-4 w-36 h-28 bg-gray-700 flex flex-col items-center justify-center rounded-lg shadow-md">
            <User className="w-6 h-6 text-gray-300" />
            <span className="text-xs text-gray-300 mt-1">Doctor</span>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 bg-white border-l border-gray-200 p-5 flex flex-col overflow-y-auto">
          {/* Doctor Info */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Doctor Details</h2>
            <p className="text-sm font-medium">{selectedDoctor.name}</p>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <Stethoscope className="w-4 h-4 mr-1 text-blue-500" />
              {selectedDoctor.specialization}
            </p>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <FileText className="w-4 h-4 mr-1 text-blue-500" />
              {selectedDoctor.qualification}
            </p>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <Clock className="w-4 h-4 mr-1 text-blue-500" />
              {selectedDoctor.experience} yrs experience
            </p>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1 text-blue-500" />
              {selectedDoctor.hospitalAffiliation}
            </p>
            <p className="text-sm flex items-center mt-1">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              {selectedDoctor.rating} ({selectedDoctor.reviewCount} reviews)
            </p>
            {selectedDoctor.ayushmanEmpanelled && (
              <p className="text-xs text-green-700 mt-2 flex items-center">
                <Shield className="w-4 h-4 mr-1" /> Ayushman Bharat Empanelled
              </p>
            )}
          </div>

          {/* Appointment Details */}
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Appointment Details</h3>
            <ul className="text-sm space-y-1">
              <li>
                <b>Date:</b> {appointmentDetails.date}
              </li>
              <li>
                <b>Time:</b> {appointmentDetails.time}
              </li>
              <li>
                <b>Type:</b> {appointmentDetails.type}
              </li>
              <li>
                <b>Reason:</b> {appointmentDetails.reason}
              </li>
              <li className="mt-1">
                <b>Fee:</b> ₹{selectedDoctor.consultationFee}
              </li>
            </ul>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Notes</h3>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              rows={5}
              placeholder="Doctor notes..."
            />
          </div>
        </aside>
      </div>

      {/* Controls */}
      <footer className="w-full bg-white py-3 flex items-center justify-center gap-6 border-t shadow-inner">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`p-3 rounded-full shadow-md transition ${
            micOn
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button className="p-3 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition">
          <PhoneOff className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
