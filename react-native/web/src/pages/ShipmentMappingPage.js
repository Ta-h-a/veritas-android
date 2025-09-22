import React, { useState } from 'react';
import axios from 'axios';

function ShipmentMappingPage() {
  const [shipmentId, setShipmentId] = useState('');
  const [deviceIds, setDeviceIds] = useState('');

  const handleMap = async () => {
    const ids = deviceIds.split(',').map(id => id.trim());
    await axios.put(`/api/v1/shipments/${shipmentId}/devices`, { deviceIds: ids });
    alert('Mapped successfully');
  };

  return (
    <div>
      <h2>Map Devices to Shipment</h2>
      <input type="text" placeholder="Shipment ID" value={shipmentId} onChange={(e) => setShipmentId(e.target.value)} />
      <input type="text" placeholder="Device IDs (comma separated)" value={deviceIds} onChange={(e) => setDeviceIds(e.target.value)} />
      <button onClick={handleMap}>Map</button>
    </div>
  );
}

export default ShipmentMappingPage;