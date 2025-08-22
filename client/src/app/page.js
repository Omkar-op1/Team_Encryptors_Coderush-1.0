"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import { Stethoscope, Phone, Globe, HeartPulse } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/chat"); // redirects to pages/chat.js
  };

  return (
    <main className="bg-gradient-to-b from-blue-50 via-white to-blue-100 min-h-screen">
      {/* Top Header: Sign In / Sign Up */}
      <div className="w-full flex justify-end px-6 py-4">
        <button onClick={() => router.push("/aasha/chat")}>Login / Chat</button>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold text-blue-800 leading-tight"
        >
          Virtual Doctor Assistant
          <span className="block text-blue-500">For Remote Areas</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl"
        >
          Get medical advice, doctor consultations, and health support directly
          from your phone – anytime, anywhere.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex gap-4"
        >
          <button
            onClick={handleGetStarted}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition"
          >
            Get Started
          </button>
          <button className="px-6 py-3 rounded-2xl bg-white border border-gray-300 text-gray-700 font-semibold shadow-md hover:bg-gray-100 transition">
            Learn More
          </button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center text-blue-700">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl shadow-lg bg-gradient-to-b from-blue-100 to-white text-center">
            <Stethoscope className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Instant Consultation</h3>
            <p className="text-gray-600">
              Connect with doctors virtually within minutes, no matter where you
              are.
            </p>
          </div>
          <div className="p-8 rounded-2xl shadow-lg bg-gradient-to-b from-blue-100 to-white text-center">
            <Phone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Access medical help anytime through voice and chat support.
            </p>
          </div>
          <div className="p-8 rounded-2xl shadow-lg bg-gradient-to-b from-blue-100 to-white text-center">
            <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Accessible Anywhere</h3>
            <p className="text-gray-600">
              Designed for rural & remote areas with low bandwidth requirements.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-center">
        <HeartPulse className="w-16 h-16 mx-auto mb-6" />
        <h2 className="text-4xl font-bold">Your Health, Our Priority</h2>
        <p className="mt-4 text-lg max-w-2xl mx-auto">
          Get access to healthcare without traveling long distances. Start your
          virtual consultation today.
        </p>
        <button
          onClick={handleGetStarted}
          className="mt-8 px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-lg hover:bg-gray-100 transition"
        >
          Start Consultation
        </button>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center bg-blue-900 text-white">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Virtual Doctor Assistant. All Rights
          Reserved.
        </p>
      </footer>
    </main>
  );
}
