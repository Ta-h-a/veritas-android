//react-native/api/routes/shipments.js

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateShipmentCreation } = require('../middleware/validation');
const Shipment = require('../models/shipment');

// Mock database
let shipments = [];

router.post('/', authenticate, requireAdmin, validateShipmentCreation, (req, res) => {
  const shipment = new Shipment(req.body);
  shipments.push(shipment);
  res.status(201).json({ shipmentId: shipment.id });
});

router.put('/:id/devices', authenticate, requireAdmin, (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }
  
  shipment.devices = req.body.deviceIds;
  res.json({ message: 'Devices mapped successfully' });
});

module.exports = router;