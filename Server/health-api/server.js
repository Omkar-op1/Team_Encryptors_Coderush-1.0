const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();

// ✅ JSON data load
const patients = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "patients.json"), "utf-8")
);

// ✅ Route for fetching patient by ABHA ID
app.get("/patients", (req, res) => {
  const abhaId = req.query.abhaId; // URL me ?abhaId=... se milega

  // Agar ABHA ID missing hai
  if (!abhaId) {
    return res.status(400).json({ message: "❌ Please provide ABHA ID" });
  }

  // JSON file me 'abha_id' key ka use
  const patient = patients.find((p) => p.abha_id === abhaId);

  if (!patient) {
    return res.status(404).json({ message: "❌ Patient not found" });
  }

  res.json(patient);
});

// ✅ Server listen
app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000")
);
