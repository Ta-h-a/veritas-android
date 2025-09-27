// models/ClerkData.js
const mongoose = require("mongoose");
const mongooseEncryption = require("mongoose-encryption");

const clerkDataSchema = new mongoose.Schema({
  clerk_id: { type: String, required: true },
  clerk_email: { type: String, required: true },
  barcode_number: { type: String, required: true },
  ocr_text: { type: String, required: true },
});

// set up encryption
const encKey = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
const sigKey = Buffer.from(process.env.SIGNING_KEY, "base64");
clerkDataSchema.plugin(mongooseEncryption, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: ["clerk_id", "clerk_email", "barcode_number", "ocr_text"],
});

module.exports = mongoose.model("ClerkData", clerkDataSchema);
