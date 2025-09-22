import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DeviceListPage() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    axios.get('/api/v1/devices').then(response => setDevices(response.data.devices));
  }, []);

  const verifyDevice = async (id) => {
    await axios.post(`/api/v1/devices/${id}/verify`);
    // Refresh list
  };

  return (
    <div>
      <h2>Device List</h2>
      {devices.map(device => (
        <div key={device.id}>
          <p>{device.model} - {device.status}</p>
          <button onClick={() => verifyDevice(device.id)}>Verify</button>
        </div>
      ))}
    </div>
  );
}

export default DeviceListPage;