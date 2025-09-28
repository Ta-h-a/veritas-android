import axios from 'axios';
import KnoxSdk from 'knox-sdk';
import { ensureCompliance, encryptData, signData } from './cryptoService';

import axios from 'axios';
import KnoxSdk from 'knox-sdk';
import useStore from './store';
import { ensureCompliance, encryptData, signData } from './cryptoService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://192.168.29.253:3001/api/v1';

const DEFAULT_TIMEOUT = 15000;
const RESPONSE_OK_STATUSES = new Set([200, 201, 202, 204]);

const computeComplianceScore = (complianceState) => {
  if (!complianceState) return 0;
  if (complianceState.errors?.length) {
    return Math.max(0, 100 - complianceState.errors.length * 40);
  }
  const warningPenalty = (complianceState.warnings?.length || 0) * 10;
  return Math.max(0, 100 - warningPenalty);
};

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const formatted = this.formatError(error);
        return Promise.reject(formatted);
      },
    );
  }

  async getComplianceContext(forceRefresh = false) {
    const store = useStore.getState();
    const lastCheck = store.deviceCompliance?.lastCheck;
    const isFresh = lastCheck && !forceRefresh && Date.now() - Date.parse(lastCheck) < 60_000;

    if (isFresh && store.knoxStatus) {
      return {
        compliance: store.deviceCompliance,
        knoxStatus: store.knoxStatus,
      };
    }

    const complianceSnapshot = await ensureCompliance();
    store.updateCompliance({
      score: computeComplianceScore(complianceSnapshot),
      warnings: complianceSnapshot.warnings,
      errors: complianceSnapshot.errors,
      lastCheck: complianceSnapshot.checkedAt,
    });

    return {
      compliance: useStore.getState().deviceCompliance,
      knoxStatus: useStore.getState().knoxStatus,
    };
  }

  async buildHeaders({
    knoxStatus,
    compliance,
    signature,
    payloadFingerprint,
    extraHeaders = {},
    adminSession,
  }) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Knox-Enabled': String(knoxStatus?.enabled ?? false),
      'X-Knox-Device-Id': knoxStatus?.deviceId || '',
      'X-Knox-Security-Level': knoxStatus?.securityLevel || 'STANDARD',
      'X-Knox-Compliance-Score': String(computeComplianceScore(compliance)),
      'X-Knox-Payload-Signature': signature || '',
      'X-Knox-Payload-Fingerprint': payloadFingerprint || '',
      'X-Knox-Timestamp': new Date().toISOString(),
      ...extraHeaders,
    };

    if (adminSession?.token) {
      headers.Authorization = `Bearer ${adminSession.token}`;
    }

    return headers;
  }

  async createSecureEnvelope(data, knoxEnabled) {
    if (!data) {
      return {
        body: null,
        signature: null,
        fingerprint: null,
      };
    }

    const serialized = JSON.stringify(data);
    const payloadFingerprint = KnoxSdk.hashData
      ? await KnoxSdk.hashData(serialized)
      : await KnoxSdk.signData(serialized);

    if (!knoxEnabled) {
      const signature = await signData(serialized);
      return {
        body: {
          payload: data,
          metadata: {
            encrypted: false,
            fingerprint: payloadFingerprint,
          },
        },
        signature,
        fingerprint: payloadFingerprint,
      };
    }

    const cipher = await encryptData(serialized);
    const signature = await KnoxSdk.signData(cipher);

    return {
      body: {
        payload: cipher,
        metadata: {
          encrypted: true,
          fingerprint: payloadFingerprint,
        },
      },
      signature,
      fingerprint: payloadFingerprint,
    };
  }

  formatError(error) {
    if (error?.response) {
      return {
        status: error.response.status,
        data: error.response.data,
        message:
          error.response.data?.message ||
          error.response.data?.error ||
          `Request failed with status code ${error.response.status}`,
      };
    }

    if (error?.request) {
      return {
        status: null,
        data: null,
        message: 'No response from server. Please check your connection.',
      };
    }

    return {
      status: null,
      data: null,
      message: error?.message || 'Unexpected error occurred.',
    };
  }

  async secureRequest({
    method = 'get',
    endpoint,
    data = null,
    params,
    headers,
    forceComplianceRefresh = false,
  }) {
    const { compliance, knoxStatus } = await this.getComplianceContext(forceComplianceRefresh);
    const adminSession = useStore.getState().adminSession;

    const { body, signature, fingerprint } = await this.createSecureEnvelope(
      data,
      knoxStatus?.enabled,
    );

    const requestHeaders = await this.buildHeaders({
      knoxStatus,
      compliance,
      signature,
      payloadFingerprint: fingerprint,
      extraHeaders: headers,
      adminSession,
    });

    const config = {
      method,
      url: endpoint,
      params,
      headers: requestHeaders,
      data: body,
    };

    const response = await this.client.request(config);

    if (!RESPONSE_OK_STATUSES.has(response.status)) {
      throw this.formatError({ response });
    }

    return response.data;
  }

  // Device APIs

  async registerDevice(deviceData) {
    return this.secureRequest({
      method: 'post',
      endpoint: '/devices',
      data: deviceData,
    });
  }

  async getDevices(filters = {}) {
    return this.secureRequest({
      method: 'get',
      endpoint: '/devices',
      params: filters,
    });
  }

  async verifyDevice(deviceId, action = 'approve') {
    return this.secureRequest({
      method: 'post',
      endpoint: `/devices/${deviceId}/verify`,
      data: { action },
    });
  }

  async fetchComplianceSummary(deviceId) {
    return this.secureRequest({
      method: 'get',
      endpoint: `/devices/${deviceId}/compliance`,
    });
  }

  // Shipment APIs
  async createShipment(shipmentData) {
    return this.secureRequest({
      method: 'post',
      endpoint: '/shipments',
      data: shipmentData,
    });
  }

  async mapDevicesToShipment(shipmentId, deviceIds) {
    return this.secureRequest({
      method: 'put',
      endpoint: `/shipments/${shipmentId}/devices`,
      data: { deviceIds },
    });
  }

  // Knox Audit APIs
  async getAuditLogs(filters = {}) {
    return this.secureRequest({
      method: 'get',
      endpoint: '/knox/audit-logs',
      params: filters,
    });
  }

  async exportAuditLogs(filters = {}) {
    return this.secureRequest({
      method: 'post',
      endpoint: '/knox/audit-logs/export',
      data: filters,
    });
  }

  async logSecurityEvent(event) {
    return this.secureRequest({
      method: 'post',
      endpoint: '/knox/audit-logs',
      data: event,
    });
  }

  async fetchComplianceOverview(params = {}) {
    return this.secureRequest({
      method: 'get',
      endpoint: '/knox/compliance',
      params,
    });
  }
}

const apiService = new ApiService();

export const registerDevice = (deviceData) => apiService.registerDevice(deviceData);
export const getDevices = (filters) => apiService.getDevices(filters);
export const verifyDevice = (deviceId, action) => apiService.verifyDevice(deviceId, action);
export const fetchDeviceCompliance = (deviceId) => apiService.fetchComplianceSummary(deviceId);
export const createShipment = (shipmentData) => apiService.createShipment(shipmentData);
export const mapDevicesToShipment = (shipmentId, deviceIds) =>
  apiService.mapDevicesToShipment(shipmentId, deviceIds);
export const getAuditLogs = (filters) => apiService.getAuditLogs(filters);
export const exportAuditLogs = (filters) => apiService.exportAuditLogs(filters);
export const logSecurityEvent = (event) => apiService.logSecurityEvent(event);
export const getComplianceOverview = (params) => apiService.fetchComplianceOverview(params);

export default apiService;