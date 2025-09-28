import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ACTION_COLORS = {
  DEVICE_REGISTERED: '#2563eb',
  DEVICE_APPROVED: '#16a34a',
  DEVICE_REJECTED: '#dc2626',
  STORAGE_WRITE: '#0ea5e9',
  STORAGE_READ: '#22c55e',
  ADMIN_LOGIN_SUCCESS: '#059669',
  ADMIN_LOGIN_FAILURE: '#f97316',
  DEFAULT: '#64748b',
};

const KnoxAuditLogItem = ({ event }) => {
  const action = event?.action || 'UNKNOWN';
  const actionColor = ACTION_COLORS[action] || ACTION_COLORS.DEFAULT;
  const timestamp = event?.timestamp
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(event.timestamp))
    : 'N/A';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.actionPill, { backgroundColor: `${actionColor}1A`, borderColor: actionColor }]}>
          <Text style={[styles.actionText, { color: actionColor }]}>{action}</Text>
        </View>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>

      <View style={styles.contentRow}>
        <Text style={styles.label}>Admin</Text>
        <Text style={styles.value}>{event?.user || '—'}</Text>
      </View>

      <View style={styles.contentRow}>
        <Text style={styles.label}>Device</Text>
        <Text style={styles.value}>{event?.device || '—'}</Text>
      </View>

      <View style={styles.contentRow}>
        <Text style={styles.label}>Security</Text>
        <Text style={styles.value}>
          {event?.knoxStatus || 'Unknown'} • Level {event?.securityLevel || 'STANDARD'}
        </Text>
      </View>

      {event?.details ? (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Details</Text>
          <Text style={styles.detailsText}>{event.details}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 13,
    color: '#111827',
    flexShrink: 1,
    textAlign: 'right',
  },
  detailsBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 13,
    color: '#1f2937',
  },
});

export default KnoxAuditLogItem;
