/** @format */
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "aasha_secret_key"; // ⚠️ store in .env in production

// ----------------- MongoDB Connection -----------------
mongoose
  .connect("mongodb://127.0.0.1:27017/aashaDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// ----------------- Schemas -----------------
const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  village: String,
  phone: String,
  status: String,
  visits: [
    {
      date: String,
      time: String,
      notes: String,
    },
  ],
});

const userSchema = new mongoose.Schema({
  name: String, // worker full name
  email: { type: String, unique: true },
  password: String, // hashed
});

const Patient = mongoose.model("Patient", patientSchema);
const User = mongoose.model("User", userSchema);

// ----------------- Authentication Routes -----------------

// Register new worker
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Middleware to protect routes
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// ----------------- Patient Routes (protected) -----------------
app.get("/patients", authMiddleware, async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

app.post("/patients", authMiddleware, async (req, res) => {
  const patient = new Patient(req.body);
  await patient.save();
  res.json(patient);
});


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
app.use(express.json()); // ✅ so Express parses JSON

app.use("/api", require("./routes/patientRoutes"));
// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
