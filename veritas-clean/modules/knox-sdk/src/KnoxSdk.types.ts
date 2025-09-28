export type SecurityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type DeviceInfo = {
  manufacturer: string;
  model: string;
  osVersion: string;
  securityPatch?: string | null;
  securityLevel: SecurityLevel;
  rooted: boolean;
  hardwareBackedKeystore: boolean;
  knox: {
    enabled: boolean;
    configuration: string | null;
    licenseActive: boolean;
  };
};

export type AuditLog = {
  id: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: number;
  knoxEnabled: boolean;
  securityLevel: SecurityLevel;
};

export interface KnoxSdkInterface {
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
}
