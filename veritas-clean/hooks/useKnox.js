import { useCallback, useMemo } from 'react';
import KnoxSdk from 'knox-sdk';
import useStore from '../services/store';
import { ensureCompliance } from '../services/cryptoService';
import { logSecurityEvent } from '../services/apiService';

const buildAuditPayload = (event, context = {}) => ({
  event,
  ...context,
  timestamp: new Date().toISOString(),
});

const calculateScore = (snapshot) => {
  if (!snapshot) return 0;
  if (snapshot.errors?.length) {
    return Math.max(0, 100 - snapshot.errors.length * 40);
  }
  return Math.max(0, 100 - (snapshot.warnings?.length || 0) * 10);
};

const recordAuditEvent = async (event, context) => {
  const payload = buildAuditPayload(event, context);

  try {
    await KnoxSdk.logAuditEvent(event, payload);
  } catch (error) {
    // Knox audit logging may be unavailable on non-Knox devices; fall back to API logging
  }

  try {
    await logSecurityEvent(payload);
  } catch (error) {
    // Swallow network errors but surface via debug logs for developers
    console.warn('Knox audit API logging failed', error?.message);
  }
};

export const useKnox = () => {
  const knoxStatus = useStore((state) => state.knoxStatus);
  const deviceCompliance = useStore((state) => state.deviceCompliance);
  const adminSession = useStore((state) => state.adminSession);
  const adminUser = useStore((state) => state.adminUser);

  const refreshKnoxState = useCallback(async () => {
    const snapshot = await useStore.getState().refreshKnoxStatus();
    return snapshot;
  }, []);

  const checkKnoxStatus = useCallback(async ({ force = false } = {}) => {
    if (!force) {
      return {
        knoxStatus: useStore.getState().knoxStatus,
        compliance: useStore.getState().deviceCompliance,
      };
    }

    const snapshot = await refreshKnoxState();
    return snapshot;
  }, [refreshKnoxState]);

  const checkCompliance = useCallback(async ({ log = false, context } = {}) => {
    const compliance = await ensureCompliance();

    useStore.getState().updateCompliance({
      score: calculateScore(compliance),
      warnings: compliance.warnings,
      errors: compliance.errors,
      lastCheck: compliance.checkedAt,
    });

    if (log) {
      await recordAuditEvent('KNOX_COMPLIANCE_REFRESH', {
        compliance,
        adminId: adminUser?.id,
        sessionToken: adminSession?.token,
        ...context,
      });
    }

    return compliance;
  }, [adminSession?.token, adminUser?.id]);

  const logKnoxEvent = useCallback(async (event, context = {}) => {
    await recordAuditEvent(event, {
      adminId: adminUser?.id,
      sessionToken: adminSession?.token,
      knoxStatus,
      compliance: deviceCompliance,
      ...context,
    });
  }, [adminSession?.token, adminUser?.id, deviceCompliance, knoxStatus]);

  const summary = useMemo(() => ({
    enabled: Boolean(knoxStatus?.enabled),
    securityLevel: knoxStatus?.securityLevel || 'STANDARD',
  complianceScore: deviceCompliance?.score ?? calculateScore(deviceCompliance),
    warnings: deviceCompliance?.warnings || [],
    errors: deviceCompliance?.errors || [],
  }), [deviceCompliance, knoxStatus]);

  return {
    knoxStatus,
    compliance: deviceCompliance,
    adminSession,
    adminUser,
    isKnoxEnabled: summary.enabled,
    securityLevel: summary.securityLevel,
    complianceScore: summary.complianceScore,
    warnings: summary.warnings,
    errors: summary.errors,
    checkKnoxStatus,
    checkCompliance,
    refreshKnoxState,
    logKnoxEvent,
  };
};

export default useKnox;
