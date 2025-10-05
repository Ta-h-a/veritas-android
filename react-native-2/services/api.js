// services/api.js
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { encryptData, decryptData } from '../../react-native-2/utils/encryption';

const getExpoExtra = () => {
  const expoConfig = Constants?.expoConfig ?? Constants?.manifest ?? {};
  return expoConfig?.extra ?? {};
};

const resolveApiBaseUrl = () => {
  const extra = getExpoExtra();
  const envUrl = process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl;

  if (envUrl && envUrl.length > 0) {
    return envUrl;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }

  return 'http://localhost:8080';
};

const resolveClientKey = () => {
  const extra = getExpoExtra();
  return process.env.EXPO_PUBLIC_CLIENT_ENCRYPTION_KEY ?? extra.clientEncryptionKey;
};

const API_BASE_URL = resolveApiBaseUrl();
const CLIENT_ENCRYPTION_KEY = resolveClientKey();

const requireClientKey = () => {
  if (!CLIENT_ENCRYPTION_KEY) {
    throw new Error('Client encryption key is not configured. Check your Expo env settings.');
  }

  return CLIENT_ENCRYPTION_KEY;
};

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[API] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Submit clerk data with encryption
   * @param {Object} clerkData - Clerk data to submit
   * @returns {Promise<Object>} Response from server
   */
  async submitClerkData(clerkData) {
    try {
      // Encrypt data before sending
  const encrypted = await encryptData(clerkData, requireClientKey());

      const response = await this.client.post('/api/clerkdata/secure', encrypted);

      // Decrypt response
      const { encryptedPayload, iv, authTag } = response.data;
      const decrypted = await decryptData(encryptedPayload, iv, authTag, requireClientKey());

      return decrypted;
    } catch (error) {
      console.error('Error submitting clerk data:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get clerk data by ID
   * @param {string} clerkId - Clerk ID
   * @returns {Promise<Object>} Decrypted clerk data
   */
  async getClerkData(clerkId) {
    try {
      const response = await this.client.get(`/api/clerkdata/secure/${clerkId}`);

      // Decrypt response
      const { encryptedPayload, iv, authTag } = response.data;
      const decrypted = await decryptData(encryptedPayload, iv, authTag, requireClientKey());

      return decrypted.data;
    } catch (error) {
      console.error('Error getting clerk data:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all clerk data for a specific clerk ID
   * @param {string} clerkId - Clerk ID
   * @returns {Promise<Array>} Array of decrypted clerk data
   */
  async getAllClerkData(clerkId) {
    try {
      const response = await this.client.get(`/api/clerkdata/secure/all/${clerkId}`);

      // Decrypt response
      const { encryptedPayload, iv, authTag } = response.data;
      const decrypted = await decryptData(encryptedPayload, iv, authTag, requireClientKey());

      return decrypted.data;
    } catch (error) {
      console.error('Error getting all clerk data:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Upload image to server
   * @param {Object} imageFile - Image file object with uri, type, name
   * @returns {Promise<Object>} Upload response with image URL
   */
  async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.name || 'image.jpg',
      });

      const response = await this.client.post('/api/upload/secure', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Decrypt response
      const { encryptedPayload, iv, authTag } = response.data;
      const decrypted = await decryptData(
        encryptedPayload,
        iv,
        authTag,
        CLIENT_ENCRYPTION_KEY
      );

      return decrypted;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Extract text from image using OCR
   * @param {Object} imageFile - Image file object
   * @returns {Promise<Object>} OCR result with extracted text
   */
  async extractText(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.name || 'image.jpg',
      });

      const response = await this.client.post('/api/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update clerk information
   * @param {string} clerkId - Clerk ID
   * @param {Object} updateData - Data to update (category, state, city)
   * @returns {Promise<Object>} Updated clerk data
   */
  async updateClerkInfo(clerkId, updateData) {
    try {
      const response = await this.client.put(`/api/update-info/${clerkId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating clerk info:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete clerk data
   * @param {string} id - Clerk data ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteClerkData(id) {
    try {
      const response = await this.client.delete(`/api/clerkdata/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting clerk data:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check server health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error';
      const statusCode = error.response.status;
      
      return new Error(`[${statusCode}] ${message}`);
    } else if (error.request) {
      // Request made but no response received
      return new Error('No response from server. Please check your connection.');
    } else {
      // Error in request setup
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// Export singleton instance
export default new ApiService();