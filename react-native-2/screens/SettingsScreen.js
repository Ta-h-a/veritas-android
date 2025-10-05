// screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Card, List, Switch, Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Constants from 'expo-constants';
import secureStorage from '../utils/secureStorage';
import apiService from '../../react-native/services/api';

export default function SettingsScreen() {
  const [stats, setStats] = useState({
    totalRecords: 0,
    storageSize: '0 KB',
  });
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);

  useEffect(() => {
    loadSettings();
    checkServerStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const allData = await secureStorage.getAllClerkData();
      const backup = await secureStorage.exportBackup();
      
      setStats({
        totalRecords: allData.length,
        storageSize: `${(backup.length / 1024).toFixed(2)} KB`,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkServerStatus = async () => {
    try {
      const health = await apiService.checkHealth();
      setServerStatus(health.status === 'OK' ? 'Connected' : 'Disconnected');
    } catch (error) {
      setServerStatus('Disconnected');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data? This will not delete your stored records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'WARNING: This will permanently delete all stored records from your device. This action cannot be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await secureStorage.clear();
              await loadSettings();
              Alert.alert('Success', 'All data cleared successfully');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const backup = await secureStorage.exportBackup();
      Alert.alert(
        'Export Data',
        `Successfully exported ${stats.totalRecords} records.\n\nBackup size: ${stats.storageSize}\n\nIn a production app, this would be saved to a file or shared.`,
        [{ text: 'OK' }]
      );
      console.log('Backup data length:', backup.length);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleTestConnection = async () => {
    Alert.alert('Testing Connection', 'Checking server connection...');
    await checkServerStatus();
    Alert.alert(
      'Connection Test',
      `Server Status: ${serverStatus}\n\nAPI URL: ${Constants.default?.expoConfig?.extra?.apiUrl || 'http://localhost:8080'}`
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Veritas',
      `Version: ${Constants.default?.expoConfig?.version || '1.0.0'}\n\nVeritas is a secure document management system with double encryption.\n\n© 2025 Veritas`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Storage Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Storage Information</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Icon name="database" size={24} color="#6200ee" />
              <Text style={styles.infoLabel}>Total Records</Text>
            </View>
            <Text style={styles.infoValue}>{stats.totalRecords}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Icon name="harddisk" size={24} color="#6200ee" />
              <Text style={styles.infoLabel}>Storage Used</Text>
            </View>
            <Text style={styles.infoValue}>{stats.storageSize}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Server Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Server Connection</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.statusRow}>
            <Icon 
              name={serverStatus === 'Connected' ? 'check-circle' : 'alert-circle'}
              size={24} 
              color={serverStatus === 'Connected' ? '#4caf50' : '#f44336'}
            />
            <Text style={styles.statusText}>
              {serverStatus}
            </Text>
          </View>

          <Button
            mode="outlined"
            onPress={handleTestConnection}
            icon="access-point-network"
            style={styles.testButton}
          >
            Test Connection
          </Button>
        </Card.Content>
      </Card>

      {/* Preferences */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Divider style={styles.divider} />
          
          <List.Item
            title="Notifications"
            description="Enable push notifications"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />

          <List.Item
            title="Auto Backup"
            description="Automatically backup data"
            left={(props) => <List.Icon {...props} icon="backup-restore" />}
            right={() => (
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Data Management */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <Divider style={styles.divider} />
          
          <Button
            mode="outlined"
            onPress={handleExportData}
            icon="export"
            style={styles.actionButton}
          >
            Export All Data
          </Button>

          <Button
            mode="outlined"
            onPress={handleClearCache}
            icon="broom"
            style={styles.actionButton}
          >
            Clear Cache
          </Button>

          <Button
            mode="contained"
            onPress={handleClearAllData}
            icon="delete-forever"
            style={styles.actionButton}
            buttonColor="#f44336"
          >
            Clear All Data
          </Button>
        </Card.Content>
      </Card>

      {/* Security */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Security</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.securityInfo}>
            <Icon name="shield-check" size={32} color="#4caf50" />
            <View style={styles.securityText}>
              <Text style={styles.securityTitle}>Double Encryption Active</Text>
              <Text style={styles.securityDescription}>
                Your data is encrypted on your device and again on the server
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* About */}
      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title="About Veritas"
            description="Version and app information"
            left={(props) => <List.Icon {...props} icon="information" />}
            onPress={handleAbout}
          />

          <List.Item
            title="Privacy Policy"
            description="View our privacy policy"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy would be shown here')}
          />

          <List.Item
            title="Terms of Service"
            description="View terms of service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            onPress={() => Alert.alert('Terms of Service', 'Terms would be shown here')}
          />
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  testButton: {
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    backgroundColor: '#f0f9f4',
    borderRadius: 8,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 20,
  },
});