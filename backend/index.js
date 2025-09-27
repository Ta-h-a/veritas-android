// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ClerkData = require("./models/ClerkData");
const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Route 1: Add data (POST /api/clerkdata)
app.post("/api/clerkdata", async (req, res) => {
  try {
    const { clerk_id, clerk_email, barcode_number, ocr_text } = req.body;
    const entry = new ClerkData({
      clerk_id,
      clerk_email,
      barcode_number,
      ocr_text,
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
