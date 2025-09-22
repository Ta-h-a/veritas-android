const request = require('supertest');
const app = require('../../api/index');

describe('PUT /api/v1/shipments/:id/devices', () => {
  it('should map devices to shipment', async () => {
    const response = await request(app)
      .put('/api/v1/shipments/shipment123/devices')
      .send({
        deviceIds: ['device1', 'device2']
      })
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });
});