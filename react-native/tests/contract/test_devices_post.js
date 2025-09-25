//react-native/tests/contract/test_devices_post.js

const request = require('supertest');
const app = require('../../api/index');

describe('POST /api/v1/devices', () => {
  it('should register a new device', async () => {
    const response = await request(app)
      .post('/api/v1/devices')
      .send({
        encryptedData: 'encrypted_device_data',
        signature: 'device_signature',
        userId: 'user123'
      })
      .expect(201);

    expect(response.body).toHaveProperty('deviceId');
    expect(response.body.status).toBe('registered');
  });
});