//react-native/app/screens/AdminDashboard.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getDevices,
  verifyDevice,
  getAuditLogs,
  exportAuditLogs,
  getComplianceOverview,
  fetchDeviceCompliance,
} from '../services/apiService';
import useStore from '../services/store';
import useKnox from '../hooks/useKnox';
import {
  KnoxStatusBadge,
  SecurityLevelIndicator,
  ComplianceScore,
  KnoxAuditLogItem,
} from '../components/knox';

const TABS = [
  { id: 'devices', label: 'Devices', icon: '📱' },
  { id: 'audit', label: 'Knox Audit', icon: '🛡️' },
  { id: 'compliance', label: 'Compliance', icon: '✅' },
];

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'registered', label: 'Pending' },
  { id: 'verified', label: 'Verified' },
  { id: 'rejected', label: 'Rejected' },
];

const SECURITY_FILTERS = [
  { id: 'all', label: 'All Security Modes' },
  { id: 'knox', label: 'Knox Secured' },
  { id: 'standard', label: 'Standard' },
];

const SORT_OPTIONS = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'compliance', label: 'Highest Compliance' },
  { id: 'security', label: 'Security Level' },
];

const AUDIT_ACTION_FILTERS = [
  { id: 'ALL', label: 'All Events' },
  { id: 'DEVICE_REGISTERED', label: 'Device Registered' },
  { id: 'DEVICE_APPROVED', label: 'Device Approved' },
  { id: 'DEVICE_REJECTED', label: 'Device Rejected' },
  { id: 'ADMIN_LOGIN_SUCCESS', label: 'Admin Login' },
  { id: 'SECURE_STORAGE_WRITE', label: 'Secure Storage' },
];

const DeviceStatusBadge = ({ status }) => {
  const variants = {
    registered: { background: '#fef3c7', color: '#92400e', label: 'Pending Review' },
    verified: { background: '#dcfce7', color: '#166534', label: 'Knox Verified' },
    rejected: { background: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  };

  const variant = variants[status] || {
    background: '#e5e7eb',
    color: '#374151',
    label: status || 'Unknown',
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: variant.background }]}
    >
      <Text style={[styles.statusText, { color: variant.color }]}>{variant.label}</Text>
    </View>
  );
};

const formatTimestamp = (value) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

const AdminDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('devices');
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [refreshingDevices, setRefreshingDevices] = useState(false);
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [securityFilter, setSecurityFilter] = useState('all');
  const [sortOption, setSortOption] = useState('recent');
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({ action: 'ALL' });
  const [exportingAudit, setExportingAudit] = useState(false);
  const [complianceOverview, setComplianceOverview] = useState(null);
  const [complianceLoading, setComplianceLoading] = useState(false);

  const refreshAdminSession = useStore((state) => state.refreshAdminSession);
  const logoutAdmin = useStore((state) => state.logoutAdmin);
  const adminUser = useStore((state) => state.adminUser);

  const {
    knoxStatus,
    compliance,
    complianceScore,
    warnings,
    errors,
    logKnoxEvent,
    checkKnoxStatus,
  } = useKnox();

  const fetchDevices = useCallback(async () => {
    try {
      setLoadingDevices(true);
      const response = await getDevices();
      setDevices(response.devices || []);
    } catch (error) {
      console.error('Device load failed:', error?.message);
      Alert.alert('Device Sync Failed', error?.message || 'Unable to fetch device records.');
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      setRefreshingDevices(true);
      await fetchDevices();
    } finally {
      setRefreshingDevices(false);
    }
  }, [fetchDevices]);

  const loadAuditLogs = useCallback(async () => {
    if (activeTab !== 'audit') return;

    try {
      setAuditLoading(true);
      const response = await getAuditLogs({ action: auditFilters.action });
      setAuditLogs(response.logs || []);
    } catch (error) {
      console.error('Audit log load failed:', error?.message);
      Alert.alert('Audit Trail Error', error?.message || 'Unable to fetch audit trail.');
    } finally {
      setAuditLoading(false);
    }
  }, [activeTab, auditFilters.action]);

  const loadComplianceOverview = useCallback(async () => {
    if (activeTab !== 'compliance') return;

    try {
      setComplianceLoading(true);
      const response = await getComplianceOverview();
      setComplianceOverview(response);
    } catch (error) {
      console.error('Compliance overview failed:', error?.message);
      Alert.alert('Compliance Overview Error', error?.message || 'Unable to fetch compliance summary.');
    } finally {
      setComplianceLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchDevices();
    checkKnoxStatus({ force: true });
  }, [fetchDevices, checkKnoxStatus]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const validateSession = async () => {
        const status = await refreshAdminSession();
        if (mounted && !status.isAuthenticated) {
          Alert.alert('Session Ended', 'Please sign in again to continue.', [
            {
              text: 'Sign In',
              onPress: () => navigation.replace('AdminLogin'),
            },
          ]);
        }
      };

      validateSession();

      return () => {
        mounted = false;
      };
    }, [navigation, refreshAdminSession]),
  );

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    } else if (activeTab === 'compliance') {
      loadComplianceOverview();
    }
  }, [activeTab, loadAuditLogs, loadComplianceOverview]);

  const filteredDevices = useMemo(() => {
    let results = [...devices];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((device) =>
        device.barcode?.toLowerCase().includes(query) ||
        device.model?.toLowerCase().includes(query) ||
        device.serialNumber?.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== 'all') {
      results = results.filter((device) => device.status === statusFilter);
    }

    if (securityFilter !== 'all') {
      results = results.filter((device) => {
        const secured = device.knoxStatus?.toLowerCase?.() === 'secured' || device.securityLevel === 'HIGH';
        return securityFilter === 'knox' ? secured : !secured;
      });
    }

    if (sortOption === 'compliance') {
      results.sort((a, b) => (b.complianceScore || 0) - (a.complianceScore || 0));
    } else if (sortOption === 'security') {
      results.sort((a, b) => (b.securityLevel || '').localeCompare(a.securityLevel || ''));
    } else {
      results.sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));
    }

    return results;
  }, [devices, searchQuery, statusFilter, securityFilter, sortOption]);

  const toggleExpandDevice = (deviceId) => {
    setExpandedDevice((prev) => (prev === deviceId ? null : deviceId));
  };

  const parseImages = (device) => {
    try {
      if (typeof device.images === 'string') {
        return JSON.parse(device.images);
      }
      return Array.isArray(device.images) ? device.images : [];
    } catch (error) {
      return [];
    }
  };

  const handleVerifyDevice = (device, action) => {
    Alert.alert(
      `${action === 'approve' ? 'Approve' : 'Reject'} Device`,
      `Confirm you want to ${action} this device?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approve' ? 'Approve' : 'Reject',
          style: action === 'approve' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await verifyDevice(device.id, action);
              await logKnoxEvent(action === 'approve' ? 'DEVICE_APPROVED' : 'DEVICE_REJECTED', {
                deviceId: device.id,
                barcode: device.barcode,
              });
              await fetchDevices();
            } catch (error) {
              Alert.alert('Verification Error', error?.message || 'Unable to update device state.');
            }
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigation.replace('AdminLogin');
  };

  const renderDeviceItem = (device) => {
    const images = parseImages(device);
    const expanded = expandedDevice === device.id;

    return (
      <View key={device.id} style={styles.deviceCard}>
        <TouchableOpacity style={styles.deviceHeader} onPress={() => toggleExpandDevice(device.id)}>
          <View style={styles.deviceHeaderLeft}>
            <Text style={styles.deviceBarcode}>{device.barcode || 'Unknown Barcode'}</Text>
            <Text style={styles.deviceModel}>{device.model || 'Unknown Model'}</Text>
            <Text style={styles.deviceSerial}>S/N: {device.serialNumber || 'N/A'}</Text>
          </View>
          <View style={styles.deviceHeaderRight}>
            <View style={styles.deviceHeaderStatus}>
              <DeviceStatusBadge status={device.status} />
            </View>
            <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>

        {expanded ? (
          <View style={styles.deviceDetails}>
            <View style={styles.detailChipsRow}>
              <SecurityLevelIndicator securityLevel={device.securityLevel || device.knoxSecurityLevel || 'STANDARD'} compact />
              <ComplianceScore score={device.complianceScore ?? 0} warnings={device.complianceWarnings || []} errors={device.complianceErrors || []} showDetail={false} />
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Captured</Text>
              <Text style={styles.detailValue}>{formatTimestamp(device.createdAt || device.timestamp)}</Text>
            </View>

            {device.description ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{device.description}</Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Images</Text>
              <Text style={styles.detailValue}>{images.length} photos</Text>
            </View>

            {images.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesList}>
                {images.map((image, index) => (
                  <Image
                    key={image.id || index}
                    source={{ uri: image.data || image.uri }}
                    style={styles.deviceImage}
                  />
                ))}
              </ScrollView>
            ) : null}

            <TouchableOpacity
              style={styles.refreshComplianceButton}
              onPress={() => handleFetchDeviceCompliance(device.id)}
            >
              <Text style={styles.refreshComplianceText}>Refresh compliance snapshot</Text>
            </TouchableOpacity>

            {device.status === 'registered' ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleVerifyDevice(device, 'approve')}
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton, styles.actionButtonSpacer]}
                  onPress={() => handleVerifyDevice(device, 'reject')}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  };

  const handleExportAudit = async () => {
    try {
      setExportingAudit(true);
      await exportAuditLogs({ action: auditFilters.action });
      Alert.alert('Export Requested', 'Audit log export will be available shortly.');
    } catch (error) {
      Alert.alert('Export Failed', error?.message || 'Unable to export audit logs.');
    } finally {
      setExportingAudit(false);
    }
  };

  const handleFetchDeviceCompliance = async (deviceId) => {
    try {
      const response = await fetchDeviceCompliance(deviceId);
      setDevices((prev) =>
        prev.map((device) =>
          device.id === deviceId
            ? {
                ...device,
                complianceScore: response?.score ?? device.complianceScore,
                complianceWarnings: response?.warnings ?? device.complianceWarnings,
                complianceErrors: response?.errors ?? device.complianceErrors,
              }
            : device,
        ),
      );
      await logKnoxEvent('DEVICE_COMPLIANCE_REFRESH', { deviceId });
    } catch (error) {
      Alert.alert('Compliance Refresh Failed', error?.message || 'Unable to refresh compliance for this device.');
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'audit') {
      if (auditLoading) {
        return (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loaderLabel}>Loading Knox audit trail...</Text>
          </View>
        );
      }

      return (
        <View style={styles.auditContainer}>
          <View style={styles.auditFiltersRow}>
            {AUDIT_ACTION_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.auditFilterButton,
                  auditFilters.action === filter.id && styles.auditFilterButtonActive,
                ]}
                onPress={() => setAuditFilters({ action: filter.id })}
              >
                <Text
                  style={[
                    styles.auditFilterLabel,
                    auditFilters.action === filter.id && styles.auditFilterLabelActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.exportButton, exportingAudit && styles.exportButtonDisabled]}
            onPress={handleExportAudit}
            disabled={exportingAudit}
          >
            <Text style={styles.exportButtonText}>
              {exportingAudit ? 'Exporting...' : 'Export Knox-Signed Audit Log'}
            </Text>
          </TouchableOpacity>

          <ScrollView style={styles.auditList}>
            {auditLogs.length === 0 ? (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateTitle}>No audit events yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Actions such as device approvals, secure storage operations, and admin sign-ins will appear here in real-time.
                </Text>
              </View>
            ) : (
              auditLogs.map((log) => <KnoxAuditLogItem key={log.id || log.timestamp} event={log} />)
            )}
          </ScrollView>
        </View>
      );
    }

    if (activeTab === 'compliance') {
      if (complianceLoading) {
        return (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#22d3ee" />
            <Text style={styles.loaderLabel}>Evaluating compliance posture...</Text>
          </View>
        );
      }

      return (
        <ScrollView style={styles.complianceScroll}>
          <View style={styles.complianceHeaderCard}>
            <ComplianceScore score={complianceScore} warnings={warnings} errors={errors} />
            <SecurityLevelIndicator securityLevel={knoxStatus?.securityLevel} />
            <Text style={styles.complianceSummaryText}>
              Last Check: {formatTimestamp(compliance?.lastCheck || knoxStatus?.lastComplianceCheck)}
            </Text>
          </View>

          <View style={styles.complianceDetailCard}>
            <Text style={styles.complianceDetailTitle}>Compliance Highlights</Text>
            {(complianceOverview?.topWarnings || []).map((warning, index) => (
              <View key={`${warning}-${index}`} style={styles.complianceListRow}>
                <Text style={styles.complianceBullet}>⚠️</Text>
                <Text style={styles.complianceListText}>{warning}</Text>
              </View>
            ))}
            {(complianceOverview?.topErrors || []).map((error, index) => (
              <View key={`${error}-${index}`} style={styles.complianceListRow}>
                <Text style={styles.complianceBullet}>❗</Text>
                <Text style={[styles.complianceListText, styles.complianceError]}>{error}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }

    // Default devices tab
    if (loadingDevices) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loaderLabel}>Syncing devices with Knox...</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.devicesList}
        refreshControl={<RefreshControl refreshing={refreshingDevices} onRefresh={refreshDevices} />}
      >
        {filteredDevices.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>No devices match your filters</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your filters or add a new device to get started.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Scanner')}
            >
              <Text style={styles.primaryButtonText}>Scan New Device</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDevices.map((device) => renderDeviceItem(device))
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Knox Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {adminUser?.username || 'Administrator'} · {formatTimestamp(knoxStatus?.lastComplianceCheck)}
          </Text>
        </View>
        <View style={styles.headerBadges}>
          <KnoxStatusBadge
            knoxEnabled={knoxStatus?.enabled}
            securityLevel={knoxStatus?.securityLevel}
            size="small"
          />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'devices' ? (
        <View style={styles.filterPanel}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search barcode, model, or serial"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {STATUS_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[styles.chip, statusFilter === filter.id && styles.chipActive]}
                onPress={() => setStatusFilter(filter.id)}
              >
                <Text style={[styles.chipLabel, statusFilter === filter.id && styles.chipLabelActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {SECURITY_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[styles.chip, securityFilter === filter.id && styles.chipActive]}
                onPress={() => setSecurityFilter(filter.id)}
              >
                <Text style={[styles.chipLabel, securityFilter === filter.id && styles.chipLabelActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.chip, sortOption === option.id && styles.chipActive]}
                onPress={() => setSortOption(option.id)}
              >
                <Text style={[styles.chipLabel, sortOption === option.id && styles.chipLabelActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabIcon, activeTab === tab.id && styles.tabIconActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  headerBadges: {
    alignItems: 'flex-end',
  },
  logoutButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#ef4444',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterPanel: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#2563eb',
  },
  chipLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
  },
  chipLabelActive: {
    color: '#fff',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
    color: '#64748b',
  },
  tabIconActive: {
    color: '#fff',
  },
  tabLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#fff',
  },
  devicesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  deviceHeaderLeft: {
    flex: 1,
  },
  deviceBarcode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  deviceModel: {
    fontSize: 13,
    color: '#475569',
  },
  deviceSerial: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  deviceHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceHeaderStatus: {
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  expandIcon: {
    fontSize: 16,
    color: '#94a3b8',
    marginLeft: 8,
  },
  deviceDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 8,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  detailChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  detailValue: {
    fontSize: 13,
    color: '#0f172a',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  imagesList: {
    flexDirection: 'row',
    marginTop: 12,
  },
  deviceImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#e2e8f0',
  },
  refreshComplianceButton: {
    marginTop: 16,
  },
  refreshComplianceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonSpacer: {
    marginLeft: 12,
  },
  approveButton: {
    backgroundColor: '#16a34a',
  },
  rejectButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loaderLabel: {
    marginTop: 16,
    fontSize: 14,
    color: '#475569',
  },
  auditContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  auditFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  auditFilterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
    marginBottom: 8,
  },
  auditFilterButtonActive: {
    backgroundColor: '#1d4ed8',
  },
  auditFilterLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  auditFilterLabelActive: {
    color: '#fff',
  },
  exportButton: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  exportButtonDisabled: {
    opacity: 0.7,
  },
  exportButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  auditList: {
    flex: 1,
  },
  complianceScroll: {
    paddingHorizontal: 16,
  },
  complianceHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  complianceSummaryText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 12,
  },
  complianceDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  complianceDetailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  complianceListRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  complianceBullet: {
    marginRight: 8,
  },
  complianceListText: {
    flex: 1,
    color: '#475569',
  },
  complianceError: {
    color: '#b91c1c',
  },
});

export default AdminDashboard;