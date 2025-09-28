import AsyncStorage from '@react-native-async-storage/async-storage';
import KnoxSdk from 'knox-sdk';

const AUDIT_NAMESPACE = 'secure-storage';

const buildEnvelope = async (key, value) => {
  const plaintext = typeof value === 'string' ? value : JSON.stringify(value);
  const encryptedValue = await KnoxSdk.encryptData(plaintext);
  const signature = await KnoxSdk.signData(encryptedValue);
  return {
    encryptedValue,
    signature,
    timestamp: new Date().toISOString(),
    key,
  };
};

const verifyEnvelope = async (envelope) => {
  if (!envelope) return null;
  const { encryptedValue, signature } = envelope;
  const verified = await KnoxSdk.verifySignature(encryptedValue, signature);
  if (!verified) {
    await KnoxSdk.logAuditEvent('SECURE_STORAGE_INTEGRITY_FAILURE', envelope);
    throw new Error('Secure storage verification failed');
  }
  const decrypted = await KnoxSdk.decryptData(encryptedValue);
  try {
    return JSON.parse(decrypted);
  } catch (error) {
    return decrypted;
  }
};

const SecureStorage = {
  async setItem(key, value) {
    const envelope = await buildEnvelope(key, value);
    await AsyncStorage.setItem(key, JSON.stringify(envelope));
    await KnoxSdk.logAuditEvent('SECURE_STORAGE_WRITE', { key, timestamp: envelope.timestamp });
    return true;
  },

  async getItem(key) {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) {
      return null;
    }
    const envelope = JSON.parse(stored);
    const value = await verifyEnvelope(envelope);
    await KnoxSdk.logAuditEvent('SECURE_STORAGE_READ', { key, timestamp: new Date().toISOString() });
    return value;
  },

  async removeItem(key) {
    await AsyncStorage.removeItem(key);
    await KnoxSdk.logAuditEvent('SECURE_STORAGE_REMOVE', { key, timestamp: new Date().toISOString() });
    return true;
  },

  async clearAll(prefix = '') {
    const keys = await AsyncStorage.getAllKeys();
    const targetKeys = prefix ? keys.filter((key) => key.startsWith(prefix)) : keys;
    await AsyncStorage.multiRemove(targetKeys);
    await KnoxSdk.logAuditEvent('SECURE_STORAGE_CLEAR', {
      prefix,
      count: targetKeys.length,
      timestamp: new Date().toISOString(),
    });
    return true;
  },
};

export default SecureStorage;
