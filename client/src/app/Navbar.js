"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Globe, Settings, Video, User, LogOut, History, ChevronDown, Menu, X } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setShowProfileMenu(false);
      // Optionally redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

const getInitials = (name) => {
  console.log(user)
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'U'; // Default to 'U' for Unknown/User
  }

  
  return name
    .trim()
    .split(' ')
    .filter(word => word.length > 0)
    .slice(0, 2) // Limit to first 2 words for initials
    .map(word => word[0])
    .join('')
    .toUpperCase();
};
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
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
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg text-gray-800">HealthAssist AI</h1>
            <p className="text-sm text-gray-500">Virtual Healthcare for Remote Areas</p>
          </div>
          <div className="sm:hidden">
            <h1 className="font-bold text-lg text-gray-800">HealthAssist AI</h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-100 transition">
            <Globe className="w-4 h-4" /> English
          </button>
          <button className="flex items-center gap-1 bg-blue-600 text-white rounded-lg px-3 py-1 hover:bg-blue-700 transition">
            <Video className="w-4 h-4" /> Telemedicine
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Authentication Section */}
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {user.profilePicture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-24 truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
              
              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                  
                  <Link 
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Profile Settings</span>
                  </Link>
                  
                  <Link 
                    href="/medical-history"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <History className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Medical History</span>
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Controls */}
            <div className="flex flex-col gap-3">
              <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100 transition">
                <Globe className="w-4 h-4" /> English
              </button>
              <button className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition">
                <Video className="w-4 h-4" /> Telemedicine
              </button>
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition">
                <Settings className="w-5 h-5 text-gray-600" />
                <span>Settings</span>
              </button>
            </div>

            {/* Mobile Authentication */}
            <div className="border-t border-gray-200 pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(user.name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <Link 
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Profile Settings</span>
                  </Link>
                  
                  <Link 
                    href="/medical-history"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <History className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Medical History</span>
                  </Link>
                  
                  <button
                    onClick={() => {handleLogout(); setShowMobileMenu(false);}}
                    className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link 
                    href="/login"
                    className="block w-full px-4 py-2 text-center border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup"
                    className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}