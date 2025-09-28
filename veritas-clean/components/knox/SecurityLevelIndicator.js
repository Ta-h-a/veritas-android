import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SECURITY_COLORS = {
  STANDARD: '#6b7280',
  ENHANCED: '#2563eb',
  HIGH: '#0ea5e9',
  CRITICAL: '#ef4444',
  "HARDWARE-BACKED": '#0f766e',
};

const SecurityLevelIndicator = ({ securityLevel = 'STANDARD', compact = false }) => {
  const normalized = securityLevel?.toUpperCase?.() || 'STANDARD';
  const color = SECURITY_COLORS[normalized] || SECURITY_COLORS.STANDARD;

  return (
    <View style={[styles.container, compact && styles.compact, { borderColor: color }]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.textContainer}>
        <Text style={[styles.label, compact && styles.labelCompact]}>Security Level</Text>
        <Text style={[styles.value, { color }]}>{normalized}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(15, 118, 110, 0.06)',
  },
  compact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 2,
  },
  labelCompact: {
    fontSize: 11,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default SecurityLevelIndicator;
