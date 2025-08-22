const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();  // <- app ki jagah router



// ✅ JSON data load
const patients = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "patients.json"), "utf-8")
);

// ✅ Route for fetching patient by ABHA ID
router.get("/patients", (req, res) => {
  const abhaId = req.query.abhaId; // URL me ?abhaId=... se milega

  if (!abhaId) {
    return res.status(400).json({ message: "❌ Please provide ABHA ID" });
  }

  const patient = patients.find((p) => p.abha_id === abhaId);

  if (!patient) {
    return res.status(404).json({ message: "❌ Patient not found" });
  }

  res.json(patient);
});

module.exports = router;   // <- router export karo
