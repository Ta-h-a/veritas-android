import KnoxSdk from 'knox-sdk';

const stringify = (payload) =>
  typeof payload === 'string' ? payload : JSON.stringify(payload);

export const encryptData = async (payload) => {
  const input = stringify(payload);
  return KnoxSdk.encryptData(input);
};

export const decryptData = async (ciphertext) => {
  const plaintext = await KnoxSdk.decryptData(ciphertext);
  try {
    return JSON.parse(plaintext);
  } catch (error) {
    return plaintext;
  }
};

export const signData = async (payload) => {
  const input = stringify(payload);
  return KnoxSdk.signData(input);
};

export const verifySignature = async (payload, signature) => {
  const input = stringify(payload);
  return KnoxSdk.verifySignature(input, signature);
};

export const getSecurityContext = async () => {
  const [enabled, securityLevel, secureInfo, deviceId, fingerprint] = await Promise.all([
    KnoxSdk.isKnoxEnabled(),
    KnoxSdk.getSecurityLevel(),
    KnoxSdk.getSecureDeviceInfo(),
    KnoxSdk.getDeviceId(),
    KnoxSdk.getDeviceFingerprint(),
  ]);

  return {
    enabled,
    securityLevel,
    secureInfo,
    deviceId,
    fingerprint,
    checkedAt: new Date().toISOString(),
  };
};

export const ensureCompliance = async () => {
  const context = await getSecurityContext();
  const warnings = [];
  const errors = [];

  if (!context.enabled) {
    warnings.push('Samsung Knox not available. Running in fallback mode.');
  }

  if (context.secureInfo?.rooted) {
    errors.push('Device appears to be rooted.');
  }

  if (!context.secureInfo?.hardwareBackedKeystore) {
    warnings.push('Hardware-backed keystore unavailable.');
  }

  return {
    ...context,
    warnings,
    errors,
  };
};