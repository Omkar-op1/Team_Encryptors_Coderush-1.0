"use client";
import { useState, useRef, useEffect } from "react";
import { User, History, LogOut, Settings, Save, Download, Menu, X, AlertTriangle, MapPin, Phone } from "lucide-react";
import Navbar from "../Navbar";

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your virtual doctor assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentState, setCurrentState] = useState("INITIAL");
  const [patientContext, setPatientContext] = useState({ symptoms: [], history: {}, lifestyle: {} });
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyHospitals, setEmergencyHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const mediaRecorderRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [sessionId] = useState(() => crypto.randomUUID() || Date.now().toString());
  const API_URL = "http://localhost:5000";

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
    getUserLocation();
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get user location for emergency services
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access denied or unavailable:", error);
        }
      );
    }
  };

  // Find nearby hospitals in case of emergency
  const findNearbyHospitals = async () => {
    if (!userLocation) return;
    
    try {
      // This would typically use a mapping service API like Google Places
      // For demo purposes, we'll use mock data
      const mockHospitals = [
        {
          name: "City General Hospital",
          address: "123 Main Street, City Center",
          distance: "1.2 km",
          phone: "+1-555-0123",
          emergency: true
        },
        {
          name: "Community Medical Center",
          address: "456 Oak Avenue, Downtown",
          distance: "2.5 km",
          phone: "+1-555-0456",
          emergency: true
        },
        {
          name: "Urgent Care Clinic",
          address: "789 Pine Road, Westside",
          distance: "3.1 km",
          phone: "+1-555-0789",
          emergency: true
        }
      ];
      
      setEmergencyHospitals(mockHospitals);
    } catch (error) {
      console.error("Error finding hospitals:", error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.log('User not authenticated');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setShowProfile(false);
      setMedicalHistory([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchMedicalHistory = async () => {
    if (!user) {
      alert("Please login to access medical history");
      return;
    }
    if (!patientId.trim()) {
      alert("Please enter a valid Patient ID");
      return;
    }

    setIsLoadingHistory(true);
    try {
      console.log('Fetching medical history with:', { userId: user.id, patientId });
      const response = await fetch(`/api/medicalHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid, patientId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch history: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Received medical history:', data);
      setMedicalHistory(data.medicalHistory || []);
    } catch (error) {
      console.error('Error fetching medical history:', {
        message: error.message,
        userId: user?.id,
        patientId,
        url: `/api/medicalHistory`,
      });
      alert(`Error fetching medical history: ${error.message}. Please check the Patient ID or contact support.`);
      setMedicalHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveConversation = async () => {
    if (!user) {
      alert('Please login to save conversations');
      return;
    }

    try {
      const response = await fetch('/api/medical/save-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          sessionId,
          messages,
          patientContext,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        alert('Conversation saved successfully!');
      } else {
        alert('Failed to save conversation');
      }
    } catch (error) {
      console.error('Save conversation error:', error);
      alert('Error saving conversation');
    }
  };

  const downloadConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.sender.toUpperCase()}: ${msg.text}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setInput("");
    setIsLoading(true);

    try {
      const requestBody = {
        sessionId,
        text: textToSend,
        ...(user && { userId: user.id })
      };

      const res = await fetch(`${API_URL}/api/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      if (!data.response) {
        throw new Error("Invalid response from server");
      }

      // Check if this is an emergency response
      if (data.isEmergency) {
        setIsEmergency(true);
        await findNearbyHospitals();
      }

      setMessages((prev) => [...prev, { 
        sender: "bot", 
        text: data.response,
        isEmergency: data.isEmergency || false,
        medicines: data.medicines || []
      }]);
      setCurrentState(data.state || "INITIAL");
      setPatientContext(data.patientContext || { symptoms: [], history: {}, lifestyle: {} });
    } catch (error) {
      console.error("Fetch error details:", {
        message: error.message,
        stack: error.stack,
        url: `${API_URL}/api/message`,
        requestBody: { sessionId, userId: user?.id, text: textToSend },
      });
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
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

          setIsLoading(true);
          try {
            const res = await fetch(`${API_URL}/transcribe`, {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`Transcription error: ${res.status} - ${errorText}`);
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
              { sender: "bot", text: "Sorry, I couldn't transcribe your audio. Please try again." },
            ]);
          } finally {
            setIsLoading(false);
          }
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Unable to access microphone. Please check permissions and try again." },
        ]);
      }
    }
  };

  const callEmergency = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const openMaps = (address) => {
    // Open maps with the address
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  const stateLabels = {
    INITIAL: "Getting Started",
    SYMPTOMS: "Collecting Symptoms",
    HISTORY: "Reviewing Medical History",
    LIFESTYLE: "Understanding Lifestyle",
    ADVICE: "Providing Advice",
    EMERGENCY: "EMERGENCY SITUATION",
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Navbar />
      
      {/* Emergency Alert Banner */}
      {isEmergency && (
        <div className="fixed top-16 left-0 right-0 bg-red-600 text-white p-3 z-40 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="font-bold">EMERGENCY DETECTED - SEEK MEDICAL HELP IMMEDIATELY</span>
            </div>
            <button 
              onClick={() => setIsEmergency(false)}
              className="text-white hover:text-red-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-center flex-1 p-4 sm:p-6 pt-20 sm:pt-28 w-full">
        <div className="w-full max-w-4xl mb-4 flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-800">
            Chat with Virtual Doctor
          </h1>
          
          {/* User Controls */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="sm:hidden p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => {setShowHistory(true);}}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    title="View Medical History"
                  >
                    <History className="w-4 h-4" />
                    <span className="hidden md:inline">History</span>
                  </button>
                  <button
                    onClick={saveConversation}
                    className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    title="Save Conversation"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden md:inline">Save</span>
                  </button>
                  <button
                    onClick={downloadConversation}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    title="Download Conversation"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden md:inline">Download</span>
                  </button>
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Profile"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user.name}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <a
                  href="/login"
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>

        {showMobileMenu && user && (
          <div className="w-full max-w-4xl mb-4 sm:hidden bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {setShowHistory(true); setShowMobileMenu(false);}}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <History className="w-4 h-4" />
                Medical History
              </button>
              <button
                onClick={() => {saveConversation(); setShowMobileMenu(false);}}
                className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Conversation
              </button>
              <button
                onClick={() => {downloadConversation(); setShowMobileMenu(false);}}
                className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Conversation
              </button>
              <button
                onClick={() => {setShowProfile(true); setShowMobileMenu(false);}}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile Settings
              </button>
            </div>
          </div>
        )}

        {!user && (
          <div className="w-full max-w-4xl mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm text-center">
              <strong>Guest Session:</strong> Your conversations won't be saved. 
              <a href="/login" className="ml-1 text-yellow-700 underline hover:text-yellow-900">
                Login
              </a> to save your medical history.
            </p>
          </div>
        )}

        <div className="w-full max-w-4xl flex-1 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden min-h-[500px] sm:min-h-[600px]">
          <div className="bg-blue-100 p-4 border-b">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className={`font-medium ${isEmergency ? "text-red-600" : "text-blue-800"}`}>
                {isEmergency ? "🚨 EMERGENCY SITUATION" : `Current Step: ${stateLabels[currentState]}`}
              </span>
              {patientContext.symptoms.length > 0 && (
                <span className="text-sm text-blue-600">
                  Symptoms: {patientContext.symptoms.join(", ")}
                </span>
              )}
            </div>
            {user && (
              <div className="mt-2 text-sm text-blue-600">
                Logged in as: {user.name} • Session will be saved
              </div>
            )}
          </div>
          
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 sm:p-4 rounded-xl max-w-[80%] ${
                  msg.sender === "bot"
                    ? msg.isEmergency 
                      ? "bg-red-100 text-red-800 border border-red-300 self-start"
                      : "bg-blue-100 text-blue-800 self-start"
                    : "bg-gray-200 text-gray-800 self-end ml-auto"
                } shadow-sm`}
              >
                <div className="text-sm sm:text-base leading-relaxed">
                  {msg.isEmergency && (
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                      <span className="font-bold text-red-600">EMERGENCY ALERT:</span>
                    </div>
                  )}
                  {msg.text}
                  {msg.medicines && msg.medicines.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xs font-semibold text-green-800 mb-1">
                        Suggested medications (consult doctor before use):
                      </div>
                      <div className="text-sm text-green-700">
                        {msg.medicines.join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-blue-600">
                <span className="inline-block animate-pulse">Processing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              className="flex-1 border rounded-xl px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <button
                onClick={toggleRecording}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 ${
                  isRecording
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-lg"
                    : "bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isRecording ? "Stop" : "🎤 Mic"}
              </button>
              <button
                onClick={() => handleSend()}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Hospital List */}
        {isEmergency && emergencyHospitals.length > 0 && (
          <div className="w-full max-w-4xl mt-4 bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-xl font-bold text-red-700">Nearby Emergency Facilities</h2>
            </div>
            
            <div className="space-y-4">
              {emergencyHospitals.map((hospital, index) => (
                <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <h3 className="font-semibold text-red-800">{hospital.name}</h3>
                  <p className="text-sm text-gray-700 mt-1">{hospital.address}</p>
                  <p className="text-xs text-gray-600 mt-1">Distance: {hospital.distance}</p>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => callEmergency(hospital.phone)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </button>
                    <button
                      onClick={() => openMaps(`${hospital.name}, ${hospital.address}`)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      <MapPin className="w-3 h-3" />
                      Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> In case of emergency, call your local emergency number (911 in US, 112 in EU) immediately.
                This information is for reference only and may not be up to date.
              </p>
            </div>
          </div>
        )}
      </div>

      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <button
                  onClick={() => {setShowHistory(true); setShowProfile(false);}}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <History className="w-5 h-5 text-gray-600" />
                  <span>View Medical History</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Medical History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient ID Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Patient ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g. 2894825"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={fetchMedicalHistory}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    patientId.trim() && !isLoadingHistory
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!patientId.trim() || isLoadingHistory}
                >
                  Fetch
                </button>
              </div>
            </div>

            {/* Provider Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Health Provider
              </label>
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full px-4 py-3 rounded-lg border text-left bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  ABHA (Coming soon)
                </button>
                <button
                  onClick={fetchMedicalHistory}
                  className={`w-full px-4 py-3 rounded-lg border text-left transition-colors ${
                    patientId.trim() && !isLoadingHistory
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!patientId.trim() || isLoadingHistory}
                >
                  Smart Health Sandbox
                </button>
                <button
                  disabled
                  className="w-full px-4 py-3 rounded-lg border text-left bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  Other Providers (Coming soon)
                </button>
              </div>
            </div>

            {/* History Display */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600">Fetching medical history...</p>
                </div>
              ) : medicalHistory.length > 0 ? (
                <div className="space-y-4">
                  {medicalHistory.map((session, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900">
                          Session {idx + 1}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        Symptoms: {session.symptoms?.join(", ") || "None recorded"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.messages?.length || 0} messages exchanged
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No medical history found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter a valid Patient ID and click Fetch or select Smart Health Sandbox
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}