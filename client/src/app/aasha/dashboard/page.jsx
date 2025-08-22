"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Stethoscope, Phone, Globe, HeartPulse, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const router = useRouter();

  // User info
  const [userName, setUserName] = useState("User");
  const [profileUrl, setProfileUrl] = useState("/profile.png");

  // Dashboard state
  const [patients, setPatients] = useState([
    { id: 1, name: "John Doe", status: "Waiting", comment: "" },
    { id: 2, name: "Jane Smith", status: "In Consultation", comment: "" },
  ]);
  const [notifications, setNotifications] = useState([]);
  const [medicines, setMedicines] = useState([
    { name: "Paracetamol", quantity: 20 },
    { name: "Ibuprofen", quantity: 0 },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const avatar = localStorage.getItem("profileUrl");
    if (name) setUserName(name);
    if (avatar) setProfileUrl(avatar);
  }, []);

  // Navigate to chat
  const handleGetStarted = () => router.push("/aasha/chat");

  // Scroll to Features section
  const handleLearnMore = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  // Toggle patient status
  const togglePatientStatus = (index) => {
    const updated = [...patients];
    updated[index].status =
      updated[index].status === "Waiting"
        ? "In Consultation"
        : updated[index].status === "In Consultation"
        ? "Completed"
        : "Waiting";
    setPatients(updated);
    setNotifications((prev) => [
      `Patient ${updated[index].name} status updated to ${updated[index].status}`,
      ...prev,
    ]);
  };

  // Add comment for a patient
  const handleCommentChange = (index, value) => {
    const updated = [...patients];
    updated[index].comment = value;
    setPatients(updated);
  };

  // Add new medicine
  const addMedicine = (name, quantity) => {
    setMedicines((prev) => [...prev, { name, quantity }]);
    setNotifications((prev) => [`New medicine added: ${name}`, ...prev]);
  };

  return (
    <main className="bg-gradient-to-b from-blue-50 via-white to-blue-100 min-h-screen p-6">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-blue-800">{userName}</span>
          <img
            src={profileUrl}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-blue-600"
          />
        </div>
        <div className="relative">
          <Bell
            className="w-6 h-6 text-blue-700 cursor-pointer"
            onClick={() => setShowNotifications(!showNotifications)}
          />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            {notifications.length}
          </span>
          {showNotifications && (
            <div className="absolute right-0 mt-8 w-64 bg-white shadow-lg rounded-lg p-4 z-50 max-h-64 overflow-y-auto">
              <h4 className="font-bold mb-2">Notifications</h4>
              <ul className="list-disc list-inside text-sm">
                {notifications.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-16">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold text-blue-800 leading-tight"
        >
          Dashboard
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex gap-4"
        >
          <button
            onClick={handleGetStarted}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition"
          >
            Chat
          </button>
          <button
            onClick={handleLearnMore}
            className="px-6 py-3 rounded-2xl bg-white border border-gray-300 text-gray-700 font-semibold shadow-md hover:bg-gray-100 transition"
          >
            Learn More
          </button>
        </motion.div>
      </section>

      {/* Patients Section */}
      <section className="py-16 px-6 bg-blue-50">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
          Patients
        </h2>
        <div className="grid gap-6 max-w-3xl mx-auto">
          {patients.map((p, idx) => (
            <div
              key={p.id}
              className="p-4 bg-white rounded-xl shadow flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{p.name}</span>
                <button
                  onClick={() => togglePatientStatus(idx)}
                  className={`px-3 py-1 rounded-full text-white ${
                    p.status === "Waiting"
                      ? "bg-yellow-500"
                      : p.status === "In Consultation"
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
                >
                  {p.status}
                </button>
              </div>
              <input
                type="text"
                placeholder="Add a comment / contact info"
                value={p.comment}
                onChange={(e) => handleCommentChange(idx, e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Medicines Section */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
          Medicines
        </h2>
        <div className="grid gap-4 max-w-3xl mx-auto">
          {medicines.map((m, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-xl shadow flex justify-between items-center"
            >
              <span>{m.name}</span>
              <span
                className={`px-3 py-1 rounded-full text-white ${
                  m.quantity > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {m.quantity} {m.quantity > 0 ? "Available" : "Out of Stock"}
              </span>
            </div>
          ))}
          {/* Add new medicine */}
          <AddMedicineForm addMedicine={addMedicine} />
        </div>
      </section>
    </main>
  );
}

// Component to add a new medicine
function AddMedicineForm({ addMedicine }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && quantity >= 0) {
      addMedicine(name, quantity);
      setName("");
      setQuantity(0);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 mt-4 justify-center items-center"
    >
      <input
        type="text"
        placeholder="Medicine Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded-lg px-3 py-2"
        required
      />
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="border rounded-lg px-3 py-2 w-24"
        min={0}
        required
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Add Medicine
      </button>
    </form>
  );
}
