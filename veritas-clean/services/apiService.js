//react-native/app/services/apiService.js

import axios from 'axios';

// Replace with your computer's actual IP address
const API_BASE_URL = 'http://192.168.29.253:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerDevice = async (deviceData) => {
  try {
    const response = await api.post('/devices', deviceData);
    return response.data;
  } catch (error) {
    console.error('API Error registering device:', error);
    throw error;
  }
};

export const getDevices = async () => {
  try {
    const response = await api.get('/devices');
    return response.data;
  } catch (error) {
    console.error('API Error getting devices:', error);
    throw error;
  }
};

export const verifyDevice = async (deviceId) => {
  try {
    const response = await api.post(`/devices/${deviceId}/verify`);
    return response.data;
  } catch (error) {
    console.error('API Error verifying device:', error);
    throw error;
  }
};

export const createShipment = async (shipmentData) => {
  try {
    const response = await api.post('/shipments', shipmentData);
    return response.data;
  } catch (error) {
    console.error('API Error creating shipment:', error);
    throw error;
  }
};

export const mapDevicesToShipment = async (shipmentId, deviceIds) => {
  try {
    const response = await api.put(`/shipments/${shipmentId}/devices`, { deviceIds });
    return response.data;
  } catch (error) {
    console.error('API Error mapping devices:', error);
    throw error;
  }
};