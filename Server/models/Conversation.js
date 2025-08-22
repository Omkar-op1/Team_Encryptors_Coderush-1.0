import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const PatientContextSchema = new mongoose.Schema({
  symptoms: { type: [String], default: [] },
  history: { type: Object, default: {} },
  lifestyle: { type: Object, default: {} }
});

const ConversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  messages: [MessageSchema],
  patientContext: { type: PatientContextSchema, default: () => ({}) },
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;