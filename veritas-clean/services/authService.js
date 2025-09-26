//react-native/app/services/authService.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the same API base URL as your existing service
const API_BASE_URL = 'http://192.168.29.253:3001/api/v1';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage keys
const AUTH_TOKEN_KEY = 'admin_auth_token';
const USER_DATA_KEY = 'admin_user_data';

// Simple admin login (for development)
export const loginAdmin = async (username, password) => {
  try {
    // For now, use hardcoded credentials
    // Later, you can replace this with actual API call
    if (username === 'admin' && password === 'admin123') {
      const userData = {
        id: 'admin-001',
        username: 'admin',
        role: 'administrator',
        loginTime: new Date().toISOString()
      };

      // Generate a simple token (in production, this would come from server)
      const token = 'admin_token_' + Date.now();

      // Store authentication data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      return {
        success: true,
        token,
        userData
      };
    } else {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Login failed. Please try again.'
    };
  }
};

// Check if admin is logged in
export const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);

    if (token && userData) {
      return {
        isAuthenticated: true,
        token,
        userData: JSON.parse(userData)
      };
    } else {
      return {
        isAuthenticated: false,
        token: null,
        userData: null
      };
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      isAuthenticated: false,
      token: null,
      userData: null
    };
  }
};

// Logout admin
export const logoutAdmin = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
};

// Get current admin data
export const getCurrentAdmin = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Get admin data error:', error);
    return null;
  }
};

// Add authentication header to API requests (for future use)
export const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.error('Get auth headers error:', error);
    return {};
  }
};