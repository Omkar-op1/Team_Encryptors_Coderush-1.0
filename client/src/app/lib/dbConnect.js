// lib/dbConnect.js
import mongoose from "mongoose";

let isConnected = false; // Track connection

export async function dbConnect() {
  if (isConnected) {
    console.log("✅ Using existing database connection");
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in environment variables");
    }

    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("MongoDB connection failed");
  }
}
