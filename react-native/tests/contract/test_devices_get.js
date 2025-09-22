const request = require('supertest');
const app = require('../../api/index');

describe('GET /api/v1/devices', () => {
  it('should list devices', async () => {
    const response = await request(app)
      .get('/api/v1/devices')
      .expect(200);

    expect(response.body).toHaveProperty('devices');
    expect(Array.isArray(response.body.devices)).toBe(true);
  });
});