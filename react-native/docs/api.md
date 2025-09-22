# Prism React API Documentation

## Overview
The Prism React API provides endpoints for secure device registration, verification, and shipment management.

## Authentication
All endpoints require JWT authentication via Authorization header: `Bearer <token>`

## Endpoints

### Devices

#### POST /api/v1/devices
Register a new device.

**Request Body:**
```json
{
  "encryptedData": "string",
  "signature": "string",
  "userId": "uuid"
}
```

**Response:**
```json
{
  "deviceId": "uuid",
  "status": "registered"
}
```

#### GET /api/v1/devices
List devices (admin only).

**Query Params:**
- status: registered|verified|mapped

**Response:**
```json
{
  "devices": [...],
  "total": 10
}
```

#### POST /api/v1/devices/{id}/verify
Verify device signature (admin only).

**Response:**
```json
{
  "verified": true,
  "status": "verified"
}
```

### Shipments

#### POST /api/v1/shipments
Create a new shipment (admin only).

**Request Body:**
```json
{
  "destination": "string"
}
```

**Response:**
```json
{
  "shipmentId": "uuid"
}
```

#### PUT /api/v1/shipments/{id}/devices
Map devices to shipment (admin only).

**Request Body:**
```json
{
  "deviceIds": ["uuid", "uuid"]
}
```

**Response:**
```json
{
  "message": "Devices mapped successfully"
}
```