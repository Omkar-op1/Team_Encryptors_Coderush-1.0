// models/User.ts
import mongoose from "mongoose";

const MedicalHistorySchema = new mongoose.Schema({
  patient: { type: Object, default: {} },
  conditions: { type: Array, default: [] },
  medications: { type: Array, default: [] },
  observations: { type: Array, default: [] },
  timestamp: { type: Date, default: Date.now }, // Added timestamp field
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String }, // for manual login
  googleId: { type: String },     // for Google login
  name: { type: String },
  provider: { type: String, enum: ["google", "manual"], required: true },

  // 🔑 FHIR patient id (SMART or HAPI sandbox)
  patientId: { type: String },

  // 🩺 medical history from FHIR - changed to array of MedicalHistorySchema
  medicalHistory: { type: [MedicalHistorySchema], default: [] }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);