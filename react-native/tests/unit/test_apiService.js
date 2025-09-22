const { registerDevice } = require('../../app/services/apiService');

jest.mock('axios');

describe('API Service', () => {
  it('should register device', async () => {
    // Mock axios
    const mockResponse = { data: { deviceId: '123' } };
    require('axios').post.mockResolvedValue(mockResponse);
    
    const result = await registerDevice({ encryptedData: 'data' });
    expect(result.deviceId).toBe('123');
  });
});