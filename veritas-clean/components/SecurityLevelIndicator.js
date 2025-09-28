import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LEVEL_STYLES = {
  HIGH: {
    label: 'High',
    background: 'rgba(34,197,94,0.12)',
    border: '#16a34a',
    text: '#15803d',
  },
  MEDIUM: {
    label: 'Medium',
    background: 'rgba(250,204,21,0.16)',
    border: '#ca8a04',
    text: '#92400e',
  },
  LOW: {
    label: 'Low',
    background: 'rgba(245,158,11,0.16)',
    border: '#ea580c',
    text: '#9a3412',
  },
  STANDARD: {
    label: 'Standard',
    background: 'rgba(148,163,184,0.14)',
    border: '#64748b',
    text: '#475569',
  },
};

const SecurityLevelIndicator = ({ level = 'STANDARD', showLabel = true, compact = false, style }) => {
  const normalized = (level || 'STANDARD').toUpperCase();
  const variant = LEVEL_STYLES[normalized] || LEVEL_STYLES.STANDARD;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variant.background,
          borderColor: variant.border,
          paddingVertical: compact ? 4 : 6,
          paddingHorizontal: compact ? 6 : 10,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: variant.border }]} />
      <Text
        style={[
          styles.label,
          {
            color: variant.text,
            fontSize: compact ? 12 : 14,
          },
        ]}
      >
        {showLabel ? `${variant.label} Security` : variant.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default SecurityLevelIndicator;
