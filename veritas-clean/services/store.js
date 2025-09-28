import create from 'zustand';

import SecureStorage from './secureStorage';
import { ensureCompliance } from './cryptoService';
import { checkAuthStatus, logoutAdmin as logoutAdminService } from './authService';

const STORE_KEY = '@veritas/state';

const defaultState = {
  hydrated: false,
  currentDevice: null,
  submissions: [],
  user: { id: 'temp-user-id' },
  knoxStatus: {
    enabled: false,
    securityLevel: 'STANDARD',
    deviceId: null,
    lastComplianceCheck: null,
    fingerprint: null,
  },
  deviceCompliance: {
    score: 0,
    warnings: [],
    errors: [],
    lastCheck: null,
  },
  adminSession: null,
  isAdminAuthenticated: false,
  adminUser: null,
  lastAdminCheck: null,
};

const serializeState = (state) => ({
  currentDevice: state.currentDevice,
  submissions: state.submissions,
  user: state.user,
  knoxStatus: state.knoxStatus,
  deviceCompliance: state.deviceCompliance,
  adminSession: state.adminSession,
  isAdminAuthenticated: state.isAdminAuthenticated,
  adminUser: state.adminUser,
  lastAdminCheck: state.lastAdminCheck,
});

const useStore = create((set, get) => ({
  ...defaultState,
  async hydrate() {
    try {
      const snapshot = await SecureStorage.getItem(STORE_KEY);
      if (snapshot) {
        set({ ...defaultState, ...snapshot, hydrated: true });
      } else {
        set({ hydrated: true });
      }
      await get().refreshKnoxStatus();
      await get().refreshAdminSession();
    } catch (error) {
      set({ hydrated: true });
    }
  },
  async persist() {
    const state = get();
    await SecureStorage.setItem(STORE_KEY, serializeState(state));
  },
  async refreshKnoxStatus() {
    const compliance = await ensureCompliance();
    const knoxStatus = {
      enabled: compliance.enabled,
      securityLevel: compliance.securityLevel || 'STANDARD',
      deviceId: compliance.deviceId,
      lastComplianceCheck: compliance.checkedAt,
      fingerprint: compliance.fingerprint,
    };
    const deviceCompliance = {
      score: compliance.errors.length === 0 ? 100 - compliance.warnings.length * 10 : 0,
      warnings: compliance.warnings,
      errors: compliance.errors,
      lastCheck: compliance.checkedAt,
    };
    set({ knoxStatus, deviceCompliance });
    await get().persist();
    return { knoxStatus, deviceCompliance };
  },
  async refreshAdminSession() {
    try {
      const status = await checkAuthStatus();
      set({
        adminSession: status.isAuthenticated
          ? { token: status.token, compliance: status.compliance }
          : null,
        adminUser: status.isAuthenticated ? status.userData : null,
        isAdminAuthenticated: status.isAuthenticated,
        lastAdminCheck: new Date().toISOString(),
      });
      await get().persist();
      return status;
    } catch (error) {
      set({
        adminSession: null,
        adminUser: null,
        isAdminAuthenticated: false,
        lastAdminCheck: new Date().toISOString(),
      });
      await get().persist();
      return {
        isAuthenticated: false,
        token: null,
        userData: null,
        compliance: null,
      };
    }
  },
  setCurrentDevice(device) {
    set({ currentDevice: device });
    get().persist().catch(() => undefined);
  },
  addSubmission(submission) {
    set((state) => ({ submissions: [...state.submissions, submission] }));
    get().persist().catch(() => undefined);
  },
  setUser(user) {
    set({ user });
    get().persist().catch(() => undefined);
  },
  updateCompliance(updates) {
    set((state) => ({
      deviceCompliance: {
        ...state.deviceCompliance,
        ...updates,
        lastCheck: updates.lastCheck || new Date().toISOString(),
      },
    }));
    get().persist().catch(() => undefined);
  },
  setAdminSession(session) {
    set({
      adminSession: {
        token: session.token,
        compliance: session.compliance,
      },
      adminUser: session.userData,
      isAdminAuthenticated: true,
      lastAdminCheck: new Date().toISOString(),
    });
    get().persist().catch(() => undefined);
  },
  async logoutAdmin() {
    await logoutAdminService();
    set({
      adminSession: null,
      adminUser: null,
      isAdminAuthenticated: false,
      lastAdminCheck: new Date().toISOString(),
    });
    await get().persist();
  },
}));

export default useStore;