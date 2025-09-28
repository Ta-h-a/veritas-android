//react-native/app/screens/SuccessScreen.js

import React, { useMemo } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import useKnox from '../hooks/useKnox';
import {
  KnoxStatusBadge,
  SecurityLevelIndicator,
  ComplianceScore,
} from '../components/knox';

const defaultSummary = {
  deviceRegistered: true,
  knoxSecured: false,
  encryptionLevel: 'STANDARD',
  complianceScore: 0,
  auditEventsLogged: 0,
  recommendedActions: [],
};

export default function SuccessScreen({ navigation, route }) {
  const { summary = defaultSummary } = route.params || {};
  const { securityLevel, complianceScore, warnings } = useKnox();

  const resolvedSummary = useMemo(
    () => ({
      ...defaultSummary,
      ...summary,
      encryptionLevel: summary?.encryptionLevel || securityLevel,
      complianceScore:
        summary?.complianceScore ?? Math.round(complianceScore),
      recommendedActions: summary?.recommendedActions?.length
        ? summary.recommendedActions
        : warnings,
    }),
    [summary, securityLevel, complianceScore, warnings],
  );

  const handleStartOver = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const handleGoHome = () => {
    navigation.navigate('Welcome');
  };

  const handleViewAudit = () => {
    navigation.navigate('AdminDashboard', { initialTab: 'audit' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.title}>Device Registered Securely</Text>
        <Text style={styles.message}>
          Knox encryption sealed your submission. An administrator will review and approve the device shortly.
        </Text>

        <View style={styles.summaryCard}>
          <KnoxStatusBadge
            knoxEnabled={resolvedSummary.knoxSecured}
            securityLevel={resolvedSummary.encryptionLevel}
            size="large"
          />

          <View style={styles.summaryRow}>
            <SecurityLevelIndicator securityLevel={resolvedSummary.encryptionLevel} />
          </View>

          <View style={styles.summaryRow}>
            <ComplianceScore
              score={resolvedSummary.complianceScore}
              warnings={resolvedSummary.recommendedActions || []}
              errors={[]}
            />
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Audit Events</Text>
              <Text style={styles.statValue}>{resolvedSummary.auditEventsLogged}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Encryption</Text>
              <Text style={styles.statValue}>{resolvedSummary.encryptionLevel}</Text>
            </View>
          </View>

          {resolvedSummary.recommendedActions?.length ? (
            <View style={styles.recommendations}>
              <Text style={styles.recommendationsTitle}>Recommended Follow-ups</Text>
              {resolvedSummary.recommendedActions.map((action, index) => (
                <Text key={`${action}-${index}`} style={styles.recommendationItem}>
                  • {action}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="View Knox Audit Trail"
            onPress={handleViewAudit}
            color="#0f172a"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Register Another Device"
            onPress={handleStartOver}
            color="#16a34a"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Go to Home"
            onPress={handleGoHome}
            color="#2563eb"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  summaryRow: {
    marginTop: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  recommendations: {
    marginTop: 24,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 12,
  },
});