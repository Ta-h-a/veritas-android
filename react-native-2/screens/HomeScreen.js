// screens/HomeScreen.js
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import secureStorage from '../utils/secureStorage';
import apiService from '../services/api';

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalRecords: 0,
    recentScans: 0,
    serverStatus: 'Checking...',
  });
  const [recentData, setRecentData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
    checkServerStatus();
  }, []);

  const loadHomeData = async () => {
    try {
      const allData = await secureStorage.getAllClerkData();
      
      // Sort by last accessed/stored date
      const sortedData = allData.sort((a, b) => {
        const dateA = new Date(a.lastAccessed || a.storedAt);
        const dateB = new Date(b.lastAccessed || b.storedAt);
        return dateB - dateA;
      });

      setStats({
        ...stats,
        totalRecords: allData.length,
        recentScans: sortedData.filter(item => {
          const itemDate = new Date(item.storedAt);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return itemDate > dayAgo;
        }).length,
      });

      setRecentData(sortedData.slice(0, 5));
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const checkServerStatus = async () => {
    try {
      await apiService.checkHealth();
      setStats(prev => ({ ...prev, serverStatus: 'Connected' }));
    } catch (error) {
      setStats(prev => ({ ...prev, serverStatus: 'Disconnected' }));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    await checkServerStatus();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to Veritas</Text>
        <Text style={styles.headerSubtitle}>
          Secure Document Management System
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="database" size={32} color="#6200ee" />
            <Text style={styles.statNumber}>{stats.totalRecords}</Text>
            <Text style={styles.statLabel}>Total Records</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="clock-fast" size={32} color="#03dac6" />
            <Text style={styles.statNumber}>{stats.recentScans}</Text>
            <Text style={styles.statLabel}>Recent Scans</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Server Status */}
      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <View style={styles.statusRow}>
            <Icon 
              name={stats.serverStatus === 'Connected' ? 'check-circle' : 'alert-circle'} 
              size={24} 
              color={stats.serverStatus === 'Connected' ? '#4caf50' : '#f44336'} 
            />
            <Text style={styles.statusText}>
              Server Status: {stats.serverStatus}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/camera')}
        >
          <Icon name="camera" size={40} color="#fff" />
          <Text style={styles.actionText}>Scan Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => router.push('/upload')}
        >
          <Icon name="upload" size={40} color="#fff" />
          <Text style={styles.actionText}>Upload Image</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {recentData.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>No recent activity</Text>
            <Text style={styles.emptySubtext}>
              Start by scanning a barcode or uploading an image
            </Text>
          </Card.Content>
        </Card>
      ) : (
        recentData.map((item, index) => (
          <Card
            key={index}
            style={styles.activityCard}
            onPress={() => navigation.navigate('DataDetail', { data: item })}
          >
            <Card.Content>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>
                  {item.barcode_number || 'N/A'}
                </Text>
                <Chip mode="outlined" compact>
                  {item.category || 'Uncategorized'}
                </Chip>
              </View>
              <Text style={styles.activitySubtext}>
                {item.clerk_email || 'No email'}
              </Text>
              <Text style={styles.activityDate}>
                {formatDate(item.storedAt)}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}

      {recentData.length > 0 && (
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Data')}
          style={styles.viewAllButton}
        >
          View All Records
        </Button>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statusContent: {
    padding: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6200ee',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  actionButtonSecondary: {
    backgroundColor: '#03dac6',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  activityCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  activitySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  viewAllButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  bottomPadding: {
    height: 20,
  },
});