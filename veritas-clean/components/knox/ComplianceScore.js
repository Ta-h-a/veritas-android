import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const getScoreColor = (score) => {
  if (score >= 90) return '#16a34a';
  if (score >= 75) return '#22d3ee';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
};

const getScoreStatus = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Needs Attention';
  return 'Critical';
};

const ComplianceScore = ({ score = 0, warnings = [], errors = [], showDetail = true }) => {
  const color = getScoreColor(score);
  const status = getScoreStatus(score);

  return (
    <View style={[styles.container, { borderColor: color }]}
    >
      <Text style={[styles.score, { color }]}>{score}</Text>
      <View style={styles.content}>
        <Text style={[styles.status, { color }]}>{status}</Text>
        {showDetail ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailText}>{warnings.length} warnings</Text>
            <View style={styles.dot} />
            <Text style={styles.detailText}>{errors.length} errors</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#4b5563',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9ca3af',
    marginHorizontal: 8,
  },
});

export default ComplianceScore;
