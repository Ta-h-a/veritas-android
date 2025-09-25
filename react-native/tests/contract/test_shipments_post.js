//react-native/tests/contract/test_shipments_post.js
const request = require('supertest');
const app = require('../../api/index');

describe('POST /api/v1/shipments', () => {
  it('should create a new shipment', async () => {
    const response = await request(app)
      .post('/api/v1/shipments')
      .send({
        destination: 'Warehouse A'
      })
      .expect(201);

    expect(response.body).toHaveProperty('shipmentId');
  });
});