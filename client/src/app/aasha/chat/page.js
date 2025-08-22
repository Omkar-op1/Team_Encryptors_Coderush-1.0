/** @format */

"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, LogIn } from "lucide-react";
import { useState } from "react";

export default function AashaLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (form.email && form.password) {
      // 🔹 Save user info to localStorage for dashboard
      localStorage.setItem("userName", form.email); // or any display name
      localStorage.setItem("profileUrl", "/profile.png"); // replace with actual profile path

      // 🔹 Redirect to dashboard
      router.push("/aasha/dashboard");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* 🔹 Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Aasha Worker Login
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Please log in to access your health dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email / Worker ID
            </label>
            <div className="flex items-center border rounded-lg p-2 shadow-sm">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email or ID"
                className="flex-1 outline-none border-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="flex items-center border rounded-lg p-2 shadow-sm">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="flex-1 outline-none border-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            <LogIn className="w-5 h-5 mr-2" /> Login
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
