"use strict";

const KnoxSdk = require('../KnoxSdk').default;

const SAMPLE_PAYLOAD = {
  serialNumber: '1234567890',
  model: 'QA-DEVICE',
  barcode: 'VR-0001',
};

describe('KnoxSdk JavaScript fallback', () => {
  it('performs an encrypt/decrypt round trip', async () => {
    const plaintext = JSON.stringify(SAMPLE_PAYLOAD);
    const encrypted = await KnoxSdk.encryptData(plaintext);
    expect(encrypted).not.toEqual(plaintext);

    const decrypted = await KnoxSdk.decryptData(encrypted);
    expect(decrypted).toEqual(plaintext);
  });

  it('produces verifiable signatures', async () => {
    const payload = JSON.stringify(SAMPLE_PAYLOAD);
    const signature = await KnoxSdk.signData(payload);
    expect(typeof signature).toBe('string');
    expect(signature.length).toBeGreaterThan(0);

    const verified = await KnoxSdk.verifySignature(payload, signature);
    expect(verified).toBe(true);

    const tampered = await KnoxSdk.verifySignature(`${payload}-tampered`, signature);
    expect(tampered).toBe(false);
  });

  it('records and retrieves audit logs', async () => {
    await KnoxSdk.logAuditEvent('DEVICE_REGISTER', { deviceId: SAMPLE_PAYLOAD.serialNumber });
    await KnoxSdk.logAuditEvent('DEVICE_UPDATE', { status: 'DEPLOYED' });

    const logs = await KnoxSdk.getAuditLogs();
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs[0].action).toBe('DEVICE_UPDATE');
    expect(logs[0].details).toHaveProperty('status', 'DEPLOYED');
  });
});
