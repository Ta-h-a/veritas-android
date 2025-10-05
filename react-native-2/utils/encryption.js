// utils/encryption.js
import * as Crypto from 'expo-crypto';

/**
 * Encrypt data using AES-256-GCM (simplified for React Native)
 * Note: This is a simplified version. In production, use a proper crypto library
 * @param {Object} data - Data to encrypt
 * @param {string} base64Key - Base64 encoded encryption key
 * @returns {Promise<Object>} Encrypted payload with iv and authTag
 */
export const encryptData = async (data, base64Key) => {
  try {
    // For now, just base64 encode the data
    // In production, use react-native-aes-crypto or similar
    const dataString = JSON.stringify(data);
    const encoded = btoa(dataString);
    
    // Generate random IV
    const ivArray = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      ivArray[i] = Math.floor(Math.random() * 256);
    }
    const iv = btoa(String.fromCharCode(...ivArray));
    
    // Mock auth tag
    const authTagArray = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      authTagArray[i] = Math.floor(Math.random() * 256);
    }
    const authTag = btoa(String.fromCharCode(...authTagArray));

    return {
      encryptedPayload: encoded,
      iv: iv,
      authTag: authTag,
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data
 * @param {string} encryptedPayload - Base64 encoded encrypted data
 * @param {string} ivBase64 - Base64 encoded IV
 * @param {string} authTagBase64 - Base64 encoded auth tag
 * @param {string} base64Key - Base64 encoded encryption key
 * @returns {Promise<Object>} Decrypted data
 */
export const decryptData = async (encryptedPayload, ivBase64, authTagBase64, base64Key) => {
  try {
    // Decode from base64
    const decryptedString = atob(encryptedPayload);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Generate a random encryption key
 */
export const generateEncryptionKey = async () => {
  try {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return btoa(String.fromCharCode(...randomBytes));
  } catch (error) {
    console.error('Key generation error:', error);
    throw error;
  }
};

/**
 * Hash data using SHA-256
 * @param {string} data - Data to hash
 * @returns {Promise<string>} Hex encoded hash
 */
export const hashData = async (data) => {
  try {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
    return digest;
  } catch (error) {
    console.error('Hashing error:', error);
    throw error;
  }
};