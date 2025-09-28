
import KnoxSdk from 'knox-sdk';
import { encryptData, signData, verifySignature, ensureCompliance, getDeviceFingerprint } from './cryptoService';
import SecureStorage from './secureStorage';

const AUTH_SESSION_KEY = '@veritas/admin/session';


const buildSessionPayload = async (userData) => {
  const compliance = await ensureCompliance();
  return {
    timestamp: new Date().toISOString(),
    userData,
    compliance,
    deviceFingerprint: await getDeviceFingerprint(),
  };
};

export const loginAdmin = async (username, password) => {
  try {
    const compliance = await ensureCompliance();
    const deviceFingerprint = await getDeviceFingerprint();

    // Enforce Knox security
    if (!compliance.enabled) {
      await KnoxSdk.logAuditEvent('ADMIN_LOGIN_BLOCKED', {
        reason: 'KNOX_DISABLED',
        username,
        compliance,
        deviceFingerprint,
      });
      return {
        success: false,
        message: 'Samsung Knox security is required for administrator access.',
        compliance,
      };
    }

    // Enforce compliance
    if (compliance.errors.length > 0) {
      await KnoxSdk.logAuditEvent('ADMIN_LOGIN_BLOCKED', {
        reason: 'COMPLIANCE_ERRORS',
        username,
        compliance,
        deviceFingerprint,
      });
      return {
        success: false,
        message: 'Device failed Knox compliance checks.',
        compliance,
      };
    }

    // Validate credentials (replace with real backend check in production)
    if (!(username === 'admin' && password === 'admin123')) {
      await KnoxSdk.logAuditEvent('ADMIN_LOGIN_FAILURE', {
        username,
        compliance,
        deviceFingerprint,
      });
      return {
        success: false,
        message: 'Invalid username or password.',
        compliance,
      };
    }

    // Validate device fingerprint (prevent replay on other devices)
    if (compliance.fingerprint !== deviceFingerprint) {
      await KnoxSdk.logAuditEvent('ADMIN_LOGIN_BLOCKED', {
        reason: 'FINGERPRINT_MISMATCH',
        username,
        compliance,
        deviceFingerprint,
      });
      return {
        success: false,
        message: 'Device fingerprint mismatch. Admin login denied.',
        compliance,
      };
    }

    // Encrypt credentials for audit (never store raw password)
    const encryptedCredentials = await encryptData({ username, password });

    const userData = {
      id: 'admin-001',
      username: 'admin',
      role: 'administrator',
      loginTime: new Date().toISOString(),
      fingerprint: compliance.fingerprint,
      deviceFingerprint,
      encryptedCredentials,
    };

    const sessionPayload = await buildSessionPayload(userData);
    const sessionCipher = await encryptData(sessionPayload);
    const sessionSignature = await signData(sessionCipher);

    const session = {
      token: `knox_admin_${Date.now()}`,
      cipher: sessionCipher,
      signature: sessionSignature,
      compliance,
      deviceFingerprint,
    };

    await SecureStorage.setItem(AUTH_SESSION_KEY, session);
    await KnoxSdk.logAuditEvent('ADMIN_LOGIN_SUCCESS', {
      username,
      deviceId: compliance.deviceId,
      securityLevel: compliance.securityLevel,
      deviceFingerprint,
    });

    return {
      success: true,
      token: session.token,
      userData,
      compliance,
    };
  } catch (error) {
    console.error('Login error:', error);
    await KnoxSdk.logAuditEvent('ADMIN_LOGIN_ERROR', {
      username,
      message: error?.message,
    });
    return {
      success: false,
      message: 'Login failed. Please try again.',
    };
  }
};

export const checkAuthStatus = async () => {
  try {
    const session = await SecureStorage.getItem(AUTH_SESSION_KEY);
    if (!session) {
      return {
        isAuthenticated: false,
        token: null,
        userData: null,
        compliance: null,
      };
    }

    // Validate signature
    const signatureValid = await verifySignature(session.cipher, session.signature);
    if (!signatureValid) {
      await KnoxSdk.logAuditEvent('ADMIN_SESSION_INVALID_SIGNATURE', {
        token: session.token,
      });
      await SecureStorage.removeItem(AUTH_SESSION_KEY);
      return {
        isAuthenticated: false,
        token: null,
        userData: null,
        compliance: null,
      };
    }

    // Decrypt session
    const decrypted = await KnoxSdk.decryptData(session.cipher);
    const payload = JSON.parse(decrypted);

    // Validate device fingerprint
    const currentFingerprint = await getDeviceFingerprint();
    if (payload.deviceFingerprint !== currentFingerprint) {
      await KnoxSdk.logAuditEvent('ADMIN_SESSION_FINGERPRINT_MISMATCH', {
        token: session.token,
        expected: payload.deviceFingerprint,
        actual: currentFingerprint,
      });
      await SecureStorage.removeItem(AUTH_SESSION_KEY);
      return {
        isAuthenticated: false,
        token: null,
        userData: null,
        compliance: null,
      };
    }

    return {
      isAuthenticated: true,
      token: session.token,
      userData: payload.userData,
      compliance: payload.compliance,
    };
  } catch (error) {
    console.error('Auth check error:', error);
    await SecureStorage.removeItem(AUTH_SESSION_KEY);
    return {
      isAuthenticated: false,
      token: null,
      userData: null,
      compliance: null,
    };
  }
};

export const logoutAdmin = async () => {
  try {
    await SecureStorage.removeItem(AUTH_SESSION_KEY);
    await KnoxSdk.logAuditEvent('ADMIN_LOGOUT', {
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
};

export const getCurrentAdmin = async () => {
  const status = await checkAuthStatus();
  return status.isAuthenticated ? status.userData : null;
};

export const getAuthHeaders = async () => {
  const status = await checkAuthStatus();
  if (!status.isAuthenticated) {
    return {};
  }

  const { compliance, token } = status;
  return {
    Authorization: `Bearer ${token}`,
    'X-KNOX-DEVICE-ID': compliance?.deviceId,
    'X-KNOX-SECURITY-LEVEL': compliance?.securityLevel,
    'X-KNOX-ENABLED': String(compliance?.enabled ?? false),
  };
};