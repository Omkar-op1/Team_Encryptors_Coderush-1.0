import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import cors from "cors";
import Conversation from "./models/Conversation.js";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// MongoDB connection with retry logic
const connectToMongoDB = async () => {
  const maxRetries = 5;
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      await mongoose.connect("mongodb://localhost:27017/virtual_doctor", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log("Connected to MongoDB");
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);
      if (attempt === maxRetries) {
        console.error("Max retries reached. Could not connect to MongoDB.");
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempt++;
    }
  }
};

// Connect to MongoDB before starting the server
connectToMongoDB().then(() => {
  // Gemini API call function
  async function callGeminiAPI(prompt) {
    const apiKey = "AIzaSyDRizynqIPgiZfgrMdqcosDOWxsTGNtwEM"; // Replace with your valid Gemini API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const data = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    const maxRetries = 10;
    let attempt = 0;
    const retryDelay = 1000;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          timeout: 30000,
        });

        if (response.status === 200) {
          const result = await response.json();
          const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) throw new Error("Invalid response format from Gemini API");
          return text;
        } else if (response.status === 503) {
          console.error(`[Gemini] HTTP 503 received. Retrying in ${retryDelay}ms... (Attempt ${attempt + 1})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          attempt++;
        } else {
          throw new Error(`Gemini API request failed with HTTP code: ${response.status}`);
        }
      } catch (error) {
        console.error(`[Gemini] Error: ${error.message}`);
        if (attempt === maxRetries - 1) throw new Error(`Gemini API failed after ${maxRetries} retries: ${error.message}`);
        attempt++;
      }
    }
  }

  // Function to process patient info and generate response
  async function processPatientMessage(text, pastContext) {
    const prompt = `
      You are a medical assistant. Given the user's Juno's message and past patient context, perform two tasks:
      1. Extract new patient information (symptoms, medical history, lifestyle) from the message and return it as JSON.
      2. Generate a helpful response based on the new message and the past context.

      Current message: "${text}"
      Past context: ${JSON.stringify(pastContext, null, 2)}

      Return a JSON object with the following structure:
      {
        "patientInfo": {
          "symptoms": [],
          "history": {},
          "lifestyle": {}
        },
        "response": ""
      }

      Ensure the response is empathetic, clear, and medically appropriate. Do not provide a definitive diagnosis, but suggest possible next steps or general advice.
    `;

    try {
      const jsonText = await callGeminiAPI(prompt);
      const cleanJsonText = jsonText.replace(/```json\n|```/g, "").trim();
      const result = JSON.parse(cleanJsonText);

      if (!result.patientInfo || !result.response) {
        throw new Error("Invalid response format from Gemini");
      }

      return result;
    } catch (error) {
      console.error(`[Gemini] Error processing message: ${error.message}`);
      throw error;
    }
  }

  // Route to upload audio
  app.post("/transcribe", upload.single("audio"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const audioFilePath = req.file.path;

    execFile(
      "python",
      ["transcribe.py", audioFilePath],
      (error, stdout, stderr) => {
        fs.unlinkSync(audioFilePath); // Clean up temp file

        if (error) {
          console.error("Python error:", stderr);
          return res.status(500).json({ error: `Transcription failed: ${stderr}` });
        }

        if (!stdout || stdout.trim() === "") {
          return res.status(500).json({ error: "No transcription text received" });
        }

        res.json({ text: stdout.trim() });
      }
    );
  });

  // API Endpoint for messages
  app.post("/api/message", async (req, res) => {
    try {
      const { sessionId, userId, text } = req.body;
      if (!text || !sessionId || !userId) return res.status(400).json({ error: "Missing parameters" });

      let session = await Conversation.findOne({ sessionId });
      if (!session) {
        session = new Conversation({ sessionId, userId, messages: [], patientContext: {} });
      }

      const { patientInfo, response } = await processPatientMessage(text, session.patientContext);

      session.patientContext.symptoms = [
        ...new Set([...session.patientContext.symptoms, ...patientInfo.symptoms])
      ];
      session.patientContext.history = { ...session.patientContext.history, ...patientInfo.history };
      session.patientContext.lifestyle = { ...session.patientContext.lifestyle, ...patientInfo.lifestyle };

      session.messages.push({ sender: "user", content: text });
      session.messages.push({ sender: "assistant", content: response });

      await session.save();

      res.json({
        response,
        patientContext: session.patientContext,
        sessionId: session.sessionId
      });
    } catch (err) {
      console.error("API error:", err.message);
      res.status(500).json({ error: `Internal Server Error: ${err.message}` });
    }
  });

  app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
});