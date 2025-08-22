import express from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import healthApi from "./health-api/server.js"; // ✅ ES module style import

const app = express();
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// ✅ mount health API
app.use("/health", healthApi);

// ✅ root route
app.get("/", (req, res) => {
  res.send("Main Server Running...");
});

// ✅ transcription route
const HF_API_KEY = "YOUR_HF_API_KEY"; // 🔑 put your token here

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioFilePath = req.file.path;

    const response = await axios({
      method: "post",
      url: "https://api-inference.huggingface.co/models/openai/whisper-small",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": req.file.mimetype, // dynamic (wav, mp3, etc.)
      },
      data: fs.readFileSync(audioFilePath),
      timeout: 60000,
    });

    fs.unlinkSync(audioFilePath); // cleanup
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// ✅ single server listen
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
