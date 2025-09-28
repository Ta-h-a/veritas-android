//react-native/app/screens/DeviceFormScreen.js

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import KnoxSdk from 'knox-sdk';

import SecurityLevelIndicator from '../components/SecurityLevelIndicator';
import KnoxStatusBadge from '../components/KnoxStatusBadge';
import useStore from '../services/store';
import { encryptData } from '../services/cryptoService';

export default function DeviceFormScreen({ route, navigation }) {
  const { barcode } = route.params;
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [description, setDescription] = useState('');
  const knoxStatus = useStore((state) => state.knoxStatus);
  const deviceCompliance = useStore((state) => state.deviceCompliance);
  const refreshKnoxStatus = useStore((state) => state.refreshKnoxStatus);
  const setCurrentDevice = useStore((state) => state.setCurrentDevice);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          if (isActive) {
            await refreshKnoxStatus();
            await KnoxSdk.logAuditEvent('DEVICE_FORM_VIEW', {
              barcode,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          // Non-blocking: rely on fallback mechanisms
        }
      })();

      return () => {
        isActive = false;
      };
    }, [refreshKnoxStatus, barcode])
  );

  const hasBlockingIssues = useMemo(() => (deviceCompliance?.errors || []).length > 0, [deviceCompliance]);
  const warnings = useMemo(() => deviceCompliance?.warnings || [], [deviceCompliance]);
  const errors = useMemo(() => deviceCompliance?.errors || [], [deviceCompliance]);
  const complianceScore = useMemo(() => deviceCompliance?.score ?? 0, [deviceCompliance]);

  const handleSave = () => {
    if (hasBlockingIssues) {
      Alert.alert(
        'Security Requirements Not Met',
        'Resolve Knox compliance issues before continuing with device intake.'
      );
      return;
    }

    const device = { barcode, model, serial, description };
    setCurrentDevice(device);
    KnoxSdk.logAuditEvent('DEVICE_FORM_SUBMIT', {
      barcode,
      timestamp: new Date().toISOString(),
      hasBlockingIssues,
      complianceScore,
    }).catch(() => undefined);

    encryptData(device)
      .then((encryptedPayload) => {
        navigation.navigate('ImageCapture', { device, encryptedPayload });
      })
      .catch(() => {
        navigation.navigate('ImageCapture', { device, encryptedPayload: null });
      });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Device Details</Text>

      <KnoxStatusBadge
        knoxEnabled={knoxStatus?.enabled}
        securityLevel={knoxStatus?.securityLevel}
        size="large"
      />
      <SecurityLevelIndicator
        level={knoxStatus?.enabled ? knoxStatus.securityLevel : 'STANDARD'}
        style={styles.securityIndicator}
      />
      <Text style={styles.securityMeta}>
        Device fingerprint: {knoxStatus?.fingerprint || 'Unavailable'}
      </Text>
      <Text style={styles.securityMeta}>Compliance score: {complianceScore}/100</Text>

      {(warnings.length > 0 || errors.length > 0) && (
        <View style={[styles.callout, errors.length ? styles.errorCallout : styles.warningCallout]}>
          <Text style={styles.calloutTitle}>
            {errors.length ? 'Security Requirements Not Met' : 'Security Considerations'}
          </Text>
          {errors.map((issue) => (
            <Text key={issue} style={styles.calloutText}>
              • {issue}
            </Text>
          ))}
          {warnings.map((issue) => (
            <Text key={issue} style={styles.calloutText}>
              • {issue}
            </Text>
          ))}
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.label}>Barcode</Text>
        <TextInput 
          style={[styles.input, styles.readOnly]} 
          value={barcode}
          editable={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Model *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Enter device model" 
          value={model} 
          onChangeText={setModel}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Serial Number *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Enter serial number" 
          value={serial} 
          onChangeText={setSerial}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Enter device description (optional)" 
          value={description} 
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={4}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="Continue to Images" 
          onPress={handleSave}
          color="#2196F3"
          disabled={!model.trim() || !serial.trim() || hasBlockingIssues}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  readOnly: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  securityIndicator: {
    marginBottom: 16,
  },
  callout: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  securityMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  warningCallout: {
    backgroundColor: '#fff8e1',
    borderWidth: 1,
    borderColor: '#ffecb3',
  },
  errorCallout: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#c62828',
  },
  calloutText: {
    fontSize: 14,
    color: '#374151',
  },
});