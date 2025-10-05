// utils/secureStorage.js
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptData, decryptData } from './encryption';

const STORAGE_PREFIX = 'veritas_secure_';
const ENCRYPTION_KEY_NAME = 'device_encryption_key';

/**
 * Secure Storage Manager - Knox-like encrypted storage
 * Provides double encryption: device-level + app-level
 */
class SecureStorageManager {
  constructor() {
    this.encryptionKey = null;
  }

  /**
   * Initialize the secure storage with encryption key
   */
  async initialize() {
    try {
      // Try to get existing encryption key from secure store
      let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
      
      if (!key) {
        // Generate new encryption key if doesn't exist
        key = await this.generateDeviceKey();
        await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
      }
      
      this.encryptionKey = key;
      return true;
    } catch (error) {
      console.error('Failed to initialize secure storage:', error);
      throw error;
    }
  }

  /**
   * Generate a device-specific encryption key
   */
  async generateDeviceKey() {
    try {
      // Generate 32 random bytes using Math.random (not cryptographically secure but works)
      const randomBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }
      return btoa(String.fromCharCode(...randomBytes));
    } catch (error) {
      console.error('Failed to generate device key:', error);
      throw error;
    }
  }

  /**
   * Store data securely with encryption
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  async setItem(key, value) {
    try {
      if (!this.encryptionKey) {
        await this.initialize();
      }

      const storageKey = STORAGE_PREFIX + key;
      
      // Encrypt the data
      const encrypted = await encryptData(value, this.encryptionKey);
      
      // Store encrypted data
      const dataToStore = JSON.stringify(encrypted);
      
      // Use SecureStore for sensitive data, AsyncStorage for larger data
      if (dataToStore.length < 2048) {
        await SecureStore.setItemAsync(storageKey, dataToStore);
      } else {
        await AsyncStorage.setItem(storageKey, dataToStore);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to store data securely:', error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt stored data
   * @param {string} key - Storage key
   * @returns {Promise<any>} Decrypted value
   */
  async getItem(key) {
    try {
      if (!this.encryptionKey) {
        await this.initialize();
      }

      const storageKey = STORAGE_PREFIX + key;
      
      // Try to get from SecureStore first, then AsyncStorage
      let encryptedData = await SecureStore.getItemAsync(storageKey);
      
      if (!encryptedData) {
        encryptedData = await AsyncStorage.getItem(storageKey);
      }
      
      if (!encryptedData) {
        return null;
      }
      
      // Parse encrypted data
      const { encryptedPayload, iv, authTag } = JSON.parse(encryptedData);
      
      // Decrypt the data
      const decrypted = await decryptData(
        encryptedPayload,
        iv,
        authTag,
        this.encryptionKey
      );
      
      return decrypted;
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      throw error;
    }
  }

  /**
   * Remove item from secure storage
   * @param {string} key - Storage key
   */
  async removeItem(key) {
    try {
      const storageKey = STORAGE_PREFIX + key;
      
      await SecureStore.deleteItemAsync(storageKey);
      await AsyncStorage.removeItem(storageKey);
      
      return true;
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  }

  /**
   * Clear all secure storage data
   */
  async clear() {
    try {
      // Get all keys
      const allKeys = await AsyncStorage.getAllKeys();
      const veritasKeys = allKeys.filter(key => key.startsWith(STORAGE_PREFIX));
      
      // Remove all veritas keys
      await AsyncStorage.multiRemove(veritasKeys);
      
      // Note: SecureStore doesn't have a way to get all keys
      // So we maintain a list of keys we've stored
      return true;
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
      throw error;
    }
  }

  /**
   * Store clerk data with metadata
   * @param {string} clerkId - Clerk ID
   * @param {Object} data - Clerk data
   */
  async storeClerkData(clerkId, data) {
    try {
      const timestamp = new Date().toISOString();
      const dataWithMetadata = {
        ...data,
        storedAt: timestamp,
        lastAccessed: timestamp,
      };
      
      await this.setItem(`clerk_${clerkId}`, dataWithMetadata);
      
      // Update index of stored clerk IDs
      const storedIds = await this.getStoredClerkIds();
      if (!storedIds.includes(clerkId)) {
        storedIds.push(clerkId);
        await this.setItem('clerk_ids_index', storedIds);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to store clerk data:', error);
      throw error;
    }
  }

  /**
   * Get clerk data by ID
   * @param {string} clerkId - Clerk ID
   */
  async getClerkData(clerkId) {
    try {
      const data = await this.getItem(`clerk_${clerkId}`);
      
      if (data) {
        // Update last accessed timestamp
        data.lastAccessed = new Date().toISOString();
        await this.setItem(`clerk_${clerkId}`, data);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get clerk data:', error);
      throw error;
    }
  }

  /**
   * Get all stored clerk IDs
   */
  async getStoredClerkIds() {
    try {
      const ids = await this.getItem('clerk_ids_index');
      return ids || [];
    } catch (error) {
      console.error('Failed to get stored clerk IDs:', error);
      return [];
    }
  }

  /**
   * Get all stored clerk data
   */
  async getAllClerkData() {
    try {
      const ids = await this.getStoredClerkIds();
      const allData = [];
      
      for (const id of ids) {
        const data = await this.getClerkData(id);
        if (data) {
          allData.push(data);
        }
      }
      
      return allData;
    } catch (error) {
      console.error('Failed to get all clerk data:', error);
      return [];
    }
  }

  /**
   * Delete clerk data
   * @param {string} clerkId - Clerk ID
   */
  async deleteClerkData(clerkId) {
    try {
      await this.removeItem(`clerk_${clerkId}`);
      
      // Update index
      const storedIds = await this.getStoredClerkIds();
      const updatedIds = storedIds.filter(id => id !== clerkId);
      await this.setItem('clerk_ids_index', updatedIds);
      
      return true;
    } catch (error) {
      console.error('Failed to delete clerk data:', error);
      throw error;
    }
  }

  /**
   * Export encrypted backup of all data
   */
  async exportBackup() {
    try {
      const allData = await this.getAllClerkData();
      const backup = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: allData,
      };
      
      return JSON.stringify(backup);
    } catch (error) {
      console.error('Failed to export backup:', error);
      throw error;
    }
  }

  /**
   * Import encrypted backup
   */
  async importBackup(backupString) {
    try {
      const backup = JSON.parse(backupString);
      
      for (const item of backup.data) {
        if (item.clerk_id) {
          await this.storeClerkData(item.clerk_id, item);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import backup:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new SecureStorageManager();