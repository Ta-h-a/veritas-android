const { signData, encryptData } = require('../../app/services/cryptoService');

describe('Crypto Service', () => {
  it('should sign data', async () => {
    const signature = await signData('test data');
    expect(signature).toBeDefined();
  });

  it('should encrypt data', async () => {
    const encrypted = await encryptData('test data', 'public_key');
    expect(encrypted).toContain('encrypted_');
  });
});