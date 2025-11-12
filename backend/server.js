import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import multer from "multer";
import fs from "fs";
import FormData from "form-data";

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for temporary file storage
const upload = multer({ dest: "uploads/" });

// -----------------------------
// Single prediction
// -----------------------------
app.post("/api/predict", async (req, res) => {
  try {
    const flaskResponse = await fetch("http://127.0.0.1:5001/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!flaskResponse.ok) {
      const error = await flaskResponse.text();
      throw new Error(`Flask error: ${error}`);
    }

    const data = await flaskResponse.json();
    res.json(data);
  } catch (err) {
    console.error("Error connecting to Flask:", err);
    res.status(500).json({ error: "Flask connection failed" });
  }
});

// -----------------------------
// File upload & prediction
// -----------------------------
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const form = new FormData();
    // ✅ Preserve original filename
    form.append("file", fs.createReadStream(req.file.path), req.file.originalname);

    const flaskResponse = await fetch("http://127.0.0.1:5001/upload", {
      method: "POST",
      body: form,
      headers: form.getHeaders(), // ✅ Required for multipart
    });

    if (!flaskResponse.ok) {
      const error = await flaskResponse.text();
      throw new Error(`Flask error: ${error}`);
    }

    const data = await flaskResponse.json();
    fs.unlinkSync(req.file.path); // Delete temporary file
    res.json(data);
  } catch (err) {
    console.error("Error uploading to Flask:", err);
    res.status(500).json({ error: "Flask upload failed" });
  }
});

// -----------------------------
// Download processed CSV
// -----------------------------
app.get("/api/download", async (req, res) => {
  try {
    const flaskResponse = await fetch("http://127.0.0.1:5001/download");

    if (!flaskResponse.ok) {
      const error = await flaskResponse.json();
      return res.status(flaskResponse.status).json(error);
    }

    const buffer = await flaskResponse.arrayBuffer();
    res.setHeader("Content-Disposition", "attachment; filename=predicted_results.csv");
    res.setHeader("Content-Type", "text/csv");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

// -----------------------------
// Start server
// -----------------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Node server running on port ${PORT}`));
