import express from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

// Hugging Face API Key
const HF_API_KEY = "YOUR_HF_API_KEY"; // 🔑 put your token here

// Route to upload audio & get transcription
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioFilePath = req.file.path;

    // Send file to Hugging Face Inference API
    const response = await axios({
      method: "post",
      url: "https://api-inference.huggingface.co/models/openai/whisper-small",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "audio/wav", // change if mp3
      },
      data: fs.readFileSync(audioFilePath),
    });

    // Delete file after processing
    fs.unlinkSync(audioFilePath);

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Transcription failed" });
  }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
