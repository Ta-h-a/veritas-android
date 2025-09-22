import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const registerDevice = async (deviceData) => {
  const response = await api.post('/devices', deviceData);
  return response.data;
};

export const getDevices = async () => {
  const response = await api.get('/devices');
  return response.data;
};

export const verifyDevice = async (deviceId) => {
  const response = await api.post(`/devices/${deviceId}/verify`);
  return response.data;
};

export const createShipment = async (shipmentData) => {
  const response = await api.post('/shipments', shipmentData);
  return response.data;
};

export const mapDevicesToShipment = async (shipmentId, deviceIds) => {
  const response = await api.put(`/shipments/${shipmentId}/devices`, { deviceIds });
  return response.data;
};