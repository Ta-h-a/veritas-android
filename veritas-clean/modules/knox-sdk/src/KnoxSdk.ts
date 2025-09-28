import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

import type { AuditLog, DeviceInfo, KnoxSdkInterface, SecurityLevel } from './KnoxSdk.types';

declare const __DEV__: boolean | undefined;

type NativeKnoxModule = {
  isKnoxEnabled(): Promise<boolean>;
  getSecurityLevel(): Promise<SecurityLevel>;
  isDeviceRooted(): Promise<boolean>;
  hasSecureStorage(): Promise<boolean>;
  encryptData(data: string): Promise<string>;
  decryptData(encryptedData: string): Promise<string>;
  signData(data: string): Promise<string>;
  verifySignature(data: string, signature: string): Promise<boolean>;
  getDeviceId(): Promise<string>;
  getSecureDeviceInfo(): Promise<DeviceInfo>;
  getDeviceFingerprint(): Promise<string>;
  logAuditEvent(action: string, details: Record<string, unknown>): Promise<boolean>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
};

const nativeModule = (() => {
  try {
    return requireNativeModule<NativeKnoxModule>('KnoxSdk');
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('[KnoxSdk] Native module unavailable, using JS fallback.', error);
    }
    return null;
  }
})();

const fallbackAuditLogs: AuditLog[] = [];

function getBuffer(): { from(input: string | Uint8Array, encoding?: string): { toString(encoding: string): string } } | undefined {
  const bufferCtor = (globalThis as Record<string, unknown>).Buffer as
    | { from(input: string | Uint8Array, encoding?: string): { toString(encoding: string): string } }
    | undefined;
  if (bufferCtor && typeof bufferCtor.from === 'function') {
    return bufferCtor;
  }
  return undefined;
}

function encodeBase64(value: string | ArrayBuffer): string {
  if (typeof globalThis.btoa === 'function' && typeof value === 'string') {
    return globalThis.btoa(value);
  }

  const buffer = getBuffer();
  if (buffer) {
    if (typeof value === 'string') {
      return buffer.from(value, 'utf8').toString('base64');
    }
      return buffer.from(new Uint8Array(value)).toString('base64');
  }

  if (typeof value !== 'string') {
    return Array.from(new Uint8Array(value))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  return value;
}

function decodeBase64(value: string): string {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(value);
  }

  const buffer = getBuffer();
  if (buffer) {
  return buffer.from(value, 'base64').toString('utf8');
  }

  return value;
}

function encodeUtf8(value: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value);
  }
  const result = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    result[index] = value.charCodeAt(index);
  }
  return result;
}

async function sha256Base64(data: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle?.digest === 'function') {
    const encoded = encodeUtf8(data);
    const sourceBuffer: ArrayBuffer =
      encoded.byteOffset === 0 && encoded.byteLength === encoded.buffer.byteLength
        ? (encoded.buffer as ArrayBuffer)
        : (encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', sourceBuffer);
    return encodeBase64(digest);
  }

  return encodeBase64(data);
}

const jsFallback: KnoxSdkInterface = {
  async isKnoxEnabled() {
    return false;
  },
  async getSecurityLevel() {
    return 'LOW';
  },
  async isDeviceRooted() {
    return false;
  },
  async hasSecureStorage() {
    return false;
  },
  async encryptData(data: string) {
    return encodeBase64(data);
  },
  async decryptData(encryptedData: string) {
    return decodeBase64(encryptedData);
  },
  async signData(data: string) {
    return sha256Base64(data);
  },
  async verifySignature(data: string, signature: string) {
    const expected = await sha256Base64(data);
    return expected === signature;
  },
  async getDeviceId() {
    return `FALLBACK-${Platform.OS.toUpperCase()}-${Date.now()}`;
  },
  async getSecureDeviceInfo() {
    return {
      manufacturer: Platform.OS === 'web' ? 'browser' : 'unknown',
      model: Platform.OS,
      osVersion: 'fallback',
      securityPatch: null,
      securityLevel: 'LOW',
      rooted: false,
      hardwareBackedKeystore: false,
      knox: {
        enabled: false,
        configuration: null,
        licenseActive: false,
      },
    };
  },
  async getDeviceFingerprint() {
    return sha256Base64(`${Platform.OS}-${Date.now()}`);
  },
  async logAuditEvent(action: string, details: Record<string, unknown>) {
    fallbackAuditLogs.unshift({
      id: `${Date.now()}-${fallbackAuditLogs.length}`,
      action,
      details,
      timestamp: Date.now(),
      knoxEnabled: false,
      securityLevel: 'LOW',
    });
    return true;
  },
  async getAuditLogs(limit?: number) {
    const effectiveLimit = typeof limit === 'number' ? limit : fallbackAuditLogs.length;
    return fallbackAuditLogs.slice(0, effectiveLimit).map((log) => ({ ...log }));
  },
};

async function callNative<T>(
  method: keyof NativeKnoxModule,
  args: unknown[],
  fallbackCall: () => Promise<T>,
): Promise<T> {
  if (!nativeModule) {
    return fallbackCall();
  }

  const nativeFn = (nativeModule as unknown as Record<string, (...fnArgs: unknown[]) => Promise<T>>)[method as string];
  if (typeof nativeFn !== 'function') {
    return fallbackCall();
  }

  try {
    return await nativeFn(...args);
  } catch (error) {
    console.warn(`[KnoxSdk] Native call ${String(method)} failed, falling back.`, error);
    return fallbackCall();
  }
}

const KnoxSdk: KnoxSdkInterface = {
  async isKnoxEnabled() {
    return callNative('isKnoxEnabled', [], jsFallback.isKnoxEnabled);
  },
  async getSecurityLevel() {
    return callNative('getSecurityLevel', [], jsFallback.getSecurityLevel);
  },
  async isDeviceRooted() {
    return callNative('isDeviceRooted', [], jsFallback.isDeviceRooted);
  },
  async hasSecureStorage() {
    return callNative('hasSecureStorage', [], jsFallback.hasSecureStorage);
  },
  async encryptData(data: string) {
    return callNative('encryptData', [data], () => jsFallback.encryptData(data));
  },
  async decryptData(encryptedData: string) {
    return callNative('decryptData', [encryptedData], () => jsFallback.decryptData(encryptedData));
  },
  async signData(data: string) {
    return callNative('signData', [data], () => jsFallback.signData(data));
  },
  async verifySignature(data: string, signature: string) {
    return callNative('verifySignature', [data, signature], () => jsFallback.verifySignature(data, signature));
  },
  async getDeviceId() {
    return callNative('getDeviceId', [], jsFallback.getDeviceId);
  },
  async getSecureDeviceInfo() {
    return callNative('getSecureDeviceInfo', [], jsFallback.getSecureDeviceInfo);
  },
  async getDeviceFingerprint() {
    return callNative('getDeviceFingerprint', [], jsFallback.getDeviceFingerprint);
  },
  async logAuditEvent(action: string, details: Record<string, unknown>) {
    return callNative('logAuditEvent', [action, details], () => jsFallback.logAuditEvent(action, details));
  },
  async getAuditLogs(limit?: number) {
    return callNative('getAuditLogs', [limit], () => jsFallback.getAuditLogs(limit));
  },
};

export default KnoxSdk;
