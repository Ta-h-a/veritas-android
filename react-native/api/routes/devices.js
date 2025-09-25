//react-native/api/models/user.js


const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateDeviceRegistration } = require('../middleware/validation');
const Device = require('../models/device');
const Submission = require('../models/submission');

// Mock database
let devices = [];
let submissions = [];

router.post('/',validateDeviceRegistration, async (req, res) => {
  try {
    const { encryptedData, signature, userId } = req.body;
    
    // Decrypt and validate (placeholder)
    const deviceData = JSON.parse(encryptedData); // Assume decrypted
    
    const device = new Device(deviceData);
    devices.push(device);
    
    const submission = new Submission({
      deviceId: device.id,
      userId,
      encryptedData,
      signature
    });
    submissions.push(submission);
    
    res.status(201).json({ deviceId: device.id, status: 'registered' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', (req, res) => {
  // Filter by status if provided
  let filteredDevices = devices;
  if (req.query.status) {
    filteredDevices = devices.filter(d => d.status === req.query.status);
  }
  res.json({ devices: filteredDevices, total: filteredDevices.length });
});

router.post('/:id/verify', (req, res) => {
  const device = devices.find(d => d.id === req.params.id);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }
  
  // Verify signature (placeholder)
  const verified = true; // Assume verification passes
  device.status = verified ? 'verified' : 'rejected';
  
  res.json({ verified, status: device.status });
});

module.exports = router;