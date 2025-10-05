//backend/index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { Storage } = require("megajs");
const path = require("path");
const crypto = require("crypto");
const ClerkData = require("./models/ClerkData.js");
const { handleTextExtraction } = require("./tesseractapi.js");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

// Middleware to validate client encryption
const validateClientEncryption = (req, res, next) => {
  const { encryptedPayload, iv, authTag } = req.body;
  
  if (!encryptedPayload || !iv || !authTag) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing encryption parameters" 
    });
  }
  
  next();
};

// Helper function to decrypt client-side encrypted data
function decryptClientData(encryptedPayload, iv, authTag) {
  try {
    const clientKey = Buffer.from(process.env.CLIENT_ENCRYPTION_KEY, "base64");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      clientKey,
      Buffer.from(iv, "base64")
    );
    
    decipher.setAuthTag(Buffer.from(authTag, "base64"));
    
    let decrypted = decipher.update(encryptedPayload, "base64", "utf8");
    decrypted += decipher.final("utf8");
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt client data");
  }
}

// Helper function to encrypt data for client response
function encryptForClient(data) {
  try {
    const clientKey = Buffer.from(process.env.CLIENT_ENCRYPTION_KEY, "base64");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", clientKey, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
    encrypted += cipher.final("base64");
    
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedPayload: encrypted,
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64")
    };
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data for client");
  }
}

// Route 1: Add data with client-side encryption (POST /api/clerkdata/secure)
app.post("/api/clerkdata/secure", validateClientEncryption, async (req, res) => {
  try {
    const { encryptedPayload, iv, authTag } = req.body;
    
    // Decrypt client-encrypted data (First layer)
    const decryptedData = decryptClientData(encryptedPayload, iv, authTag);
    
    const {
      clerk_id,
      clerk_email,
      barcode_number,
      ocr_text,
      barcode_image,
      state,
      city,
      category,
    } = decryptedData;
    
    // Save to DB (Second layer encryption via mongoose-encryption)
    const entry = new ClerkData({
      clerk_id,
      clerk_email,
      barcode_number,
      ocr_text,
      barcode_image,
      state,
      city,
      category,
    });
    
    await entry.save();
    
    // Encrypt response for client
    const responseData = encryptForClient({
      success: true,
      id: entry._id,
      message: "Data saved successfully"
    });
    
    res.status(201).json(responseData);
  } catch (err) {
    console.error("Error in secure data submission:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route 2: Fetch data with client encryption (GET /api/clerkdata/secure/:clerkId)
app.get("/api/clerkdata/secure/:clerkId", async (req, res) => {
  try {
    const clerkId = req.params.clerkId;
    
    // Fetch from DB (Mongoose decrypts second layer)
    const clerkData = await ClerkData.findOne({ clerk_id: clerkId });
    
    if (!clerkData) {
      return res.status(404).json({ 
        success: false, 
        error: "Clerk data not found" 
      });
    }
    
    // Encrypt for client (First layer for transmission)
    const responseData = encryptForClient({
      success: true,
      data: clerkData
    });
    
    res.status(200).json(responseData);
  } catch (err) {
    console.error("Error fetching secure data:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route 3: Fetch all data for specific clerk with encryption
app.get("/api/clerkdata/secure/all/:clerkId", async (req, res) => {
  try {
    const clerkId = req.params.clerkId;
    
    // Fetch all records for this clerk
    const allData = await ClerkData.find({ clerk_id: clerkId });
    
    // Encrypt response for client
    const responseData = encryptForClient({
      success: true,
      data: allData,
      count: allData.length
    });
    
    res.status(200).json(responseData);
  } catch (err) {
    console.error("Error fetching all secure data:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Original routes for backward compatibility
app.post("/api/clerkdata", async (req, res) => {
  try {
    const {
      clerk_id,
      clerk_email,
      barcode_number,
      ocr_text,
      barcode_image,
      state,
      city,
      category,
    } = req.body;
    const entry = new ClerkData({
      clerk_id,
      clerk_email,
      barcode_number,
      ocr_text,
      barcode_image,
      state,
      city,
      category,
    });
    await entry.save();
    res.status(201).json({ success: true, id: entry._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/admin/clerkdata", async (req, res) => {
  try {
    const allData = await ClerkData.find({});
    res.status(200).json(allData);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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

// Secure file upload route
app.post("/api/upload/secure", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Initialize MEGA storage
    const storage = new Storage({
      email: process.env.MEGA_EMAIL,
      password: process.env.MEGA_PASSWORD,
      allowUploadBuffering: true,
    });

    await storage.ready;

    const fileExtension = path.extname(req.file.originalname);
    const uniqueFilename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}${fileExtension}`;

    const uploadResult = await storage.upload({
      name: uniqueFilename,
      data: req.file.buffer,
      size: req.file.size,
    }).complete;

    const file = await storage.getFile(uploadResult);
    await file.setPublic();
    const publicLink = await storage.getFileLink(file);

    // Encrypt response
    const responseData = encryptForClient({
      success: true,
      imageUrl: publicLink,
    });

    res.json(responseData);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      success: false,
      message: "Error uploading file",
      error: err.message,
    });
  }
});

// Original upload route
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const storage = new Storage({
      email: process.env.MEGA_EMAIL,
      password: process.env.MEGA_PASSWORD,
      allowUploadBuffering: true,
    });

    await storage.ready;

    const fileExtension = path.extname(req.file.originalname);
    const uniqueFilename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}${fileExtension}`;

    const uploadResult = await storage.upload({
      name: uniqueFilename,
      data: req.file.buffer,
      size: req.file.size,
    }).complete;

    const file = await storage.getFile(uploadResult);
    await file.setPublic();
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

// Secure text extraction route
app.post("/api/extract-text/secure", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided"
      });
    }

    const { handleTextExtraction } = require("./tesseractapi.js");
    const result = await handleTextExtraction(req, res);
    
    // The handleTextExtraction already sends response
    // If we need to encrypt it, we'll need to modify tesseractapi.js
  } catch (error) {
    console.error("Error in secure text extraction:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

app.post("/api/extract-text", upload.single("image"), handleTextExtraction);

app.put("/api/update-info/:clerkId", async (req, res) => {
  try {
    const clerkId = req.params.clerkId;
    const { category, state, city } = req.body;

    if (
      (category && typeof category !== "string") ||
      (state && typeof state !== "string") ||
      (city && typeof city !== "string")
    ) {
      return res
        .status(400)
        .json({ error: "Category, state, and city must be strings" });
    }

    const updateFields = {};
    if (category !== undefined) updateFields.category = category;
    if (state !== undefined) updateFields.state = state;
    if (city !== undefined) updateFields.city = city;

    const updatedDoc = await ClerkData.findOneAndUpdate(
      { clerk_id: clerkId },
      updateFields,
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: "Clerk data not found" });
    }

    res.json({ message: "Information updated successfully", data: updatedDoc });
  } catch (err) {
    console.error("Error updating info:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));