//react-native/tests/contract/test_devices_verify.js

const request = require('supertest');
const app = require('../../api/index');

describe('POST /api/v1/devices/:id/verify', () => {
  it('should verify device signature', async () => {
    const response = await request(app)
      .post('/api/v1/devices/device123/verify')
      .expect(200);

    expect(response.body).toHaveProperty('verified');
    expect(typeof response.body.verified).toBe('boolean');
  });
});