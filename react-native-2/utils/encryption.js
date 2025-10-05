// utils/encryption.js
import { gcm } from '@noble/ciphers/aes.js';
import { toByteArray, fromByteArray } from 'base64-js';
import * as Crypto from 'expo-crypto';

const NONCE_LENGTH = 12; // Recommended nonce size for AES-GCM
const SUPPORTED_KEY_SIZES = [16, 24, 32];

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
const textDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;

const utf8ToBytes = (value) => {
  if (textEncoder) {
    return textEncoder.encode(value);
  }

  const utf8 = unescape(encodeURIComponent(value));
  const bytes = new Uint8Array(utf8.length);
  for (let i = 0; i < utf8.length; i += 1) {
    bytes[i] = utf8.charCodeAt(i);
  }
  return bytes;
};

const bytesToUtf8 = (bytes) => {
  if (textDecoder) {
    return textDecoder.decode(bytes);
  }

  let ascii = '';
  for (let i = 0; i < bytes.length; i += 1) {
    ascii += String.fromCharCode(bytes[i]);
  }
  return decodeURIComponent(escape(ascii));
};

const base64ToBytes = (value, label = 'value') => {
  if (!value) {
    throw new Error(`Missing ${label}`);
  }

  try {
    return toByteArray(value);
  } catch (error) {
    throw new Error(`Invalid base64 ${label}`);
  }
};

const bytesToBase64 = (bytes) => fromByteArray(bytes);

const ensureKeyBytes = (base64Key) => {
  const keyBytes = base64ToBytes(base64Key, 'encryption key');
  if (!SUPPORTED_KEY_SIZES.includes(keyBytes.length)) {
    throw new Error('Invalid encryption key length. Expected 16, 24, or 32 bytes.');
  }
  return keyBytes;
};

const getRandomNonce = async () => {
  if (globalThis?.crypto?.getRandomValues) {
    const buffer = new Uint8Array(NONCE_LENGTH);
    globalThis.crypto.getRandomValues(buffer);
    return buffer;
  }

  return Crypto.getRandomBytesAsync(NONCE_LENGTH);
};

const concatCiphertextAndTag = (ciphertext, authTag) => {
  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext, 0);
  combined.set(authTag, ciphertext.length);
  return combined;
};

/**
 * Encrypt data using AES-256-GCM
 * @param {Object} data - Data to encrypt
 * @param {string} base64Key - Base64 encoded encryption key
 * @returns {Promise<Object>} Encrypted payload with iv and authTag
 */
export const encryptData = async (data, base64Key) => {
  try {
    const keyBytes = ensureKeyBytes(base64Key);
    const iv = await getRandomNonce();
    const plaintextBytes = utf8ToBytes(JSON.stringify(data));

    const cipher = gcm(keyBytes, iv);
    const cipherOutput = cipher.encrypt(plaintextBytes);
    const ciphertext = cipherOutput.subarray(0, plaintextBytes.length);
    const authTag = cipherOutput.subarray(plaintextBytes.length);

    return {
      encryptedPayload: bytesToBase64(ciphertext),
      iv: bytesToBase64(iv),
      authTag: bytesToBase64(authTag),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data encrypted with AES-256-GCM
 * @param {string} encryptedPayload - Base64 encoded encrypted data
 * @param {string} ivBase64 - Base64 encoded IV
 * @param {string} authTagBase64 - Base64 encoded auth tag
 * @param {string} base64Key - Base64 encoded encryption key
 * @returns {Promise<Object>} Decrypted data
 */
export const decryptData = async (encryptedPayload, ivBase64, authTagBase64, base64Key) => {
  try {
    const keyBytes = ensureKeyBytes(base64Key);
    const iv = base64ToBytes(ivBase64, 'IV');
    const ciphertext = base64ToBytes(encryptedPayload, 'payload');
    const authTag = base64ToBytes(authTagBase64, 'auth tag');

    const cipher = gcm(keyBytes, iv);
    const combined = concatCiphertextAndTag(ciphertext, authTag);
    const plaintextBytes = cipher.decrypt(combined);

    return JSON.parse(bytesToUtf8(plaintextBytes));
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
    return bytesToBase64(randomBytes);
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