// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { Storage } = require("megajs");
const path = require("path");
const ClerkData = require("./models/ClerkData.js");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Route 1: Add data (POST /api/clerkdata)
app.post("/api/clerkdata", async (req, res) => {
  try {
    const { clerk_id, clerk_email, barcode_number, ocr_text, barcode_image } =
      req.body;
    const entry = new ClerkData({
      clerk_id,
      clerk_email,
      barcode_number,
      ocr_text,
      barcode_image,
    });
    await entry.save();
    res.status(201).json({ success: true, id: entry._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route 2: Fetch data (GET /api/admin/clerkdata)
app.get("/api/admin/clerkdata", async (req, res) => {
  try {
    const allData = await ClerkData.find({});
    res.status(200).json(allData);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE route to remove a specific upload by id
app.delete("/api/clerkdata/:id", async (req, res) => {
  try {
    const result = await ClerkData.findByIdAndDelete(req.params.id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// File upload route
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Initialize MEGA storage
    const storage = new Storage({
      email: process.env.MEGA_EMAIL,
      password: process.env.MEGA_PASSWORD,
      allowUploadBuffering: true, // Enable upload buffering
    });

    // Connect to MEGA
    await storage.ready;

    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const uniqueFilename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}${fileExtension}`;

    // Upload to MEGA
    const uploadResult = await storage.upload({
      name: uniqueFilename,
      data: req.file.buffer,
      size: req.file.size, // Specify the file size
    }).complete; // Wait for upload to complete

    // Create a public link
    const file = await storage.getFile(uploadResult);
    await file.setPublic(); // Make the file public
    const publicLink = await storage.getFileLink(file);

    res.json({
      success: true,
      imageUrl: publicLink,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      success: false,
      message: "Error uploading file",
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
