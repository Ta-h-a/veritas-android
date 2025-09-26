//react-native/app/screens/AdminDashboard.js

import React, { useState, useEffect } from 'react';
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
  ActivityIndicator 
} from 'react-native';
import { getDevices, verifyDevice } from '../services/apiService';

export default function AdminDashboard({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedDevice, setExpandedDevice] = useState(null);

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    filterDevices();
  }, [devices, searchQuery, selectedStatus]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await getDevices();
      setDevices(response.devices || []);
    } catch (error) {
      console.error('Error loading devices:', error);
      Alert.alert('Error', 'Failed to load devices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
  };

  const filterDevices = () => {
    let filtered = devices;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(device => 
        device.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(device => device.status === selectedStatus);
    }

    setFilteredDevices(filtered);
  };

  const handleVerifyDevice = async (deviceId, action) => {
    try {
      Alert.alert(
        `${action === 'approve' ? 'Approve' : 'Reject'} Device`,
        `Are you sure you want to ${action} this device?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: action === 'approve' ? 'Approve' : 'Reject',
            style: action === 'approve' ? 'default' : 'destructive',
            onPress: async () => {
              const response = await verifyDevice(deviceId);
              console.log('Verification response:', response);
              Alert.alert('Success', `Device ${action}d successfully`);
              loadDevices(); // Refresh the list
            }
          }
        ]
      );
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Failed to update device status');
    }
  };

  const toggleDeviceExpansion = (deviceId) => {
    setExpandedDevice(expandedDevice === deviceId ? null : deviceId);
  };

  const parseImages = (device) => {
    try {
      if (typeof device.images === 'string') {
        return JSON.parse(device.images);
      }
      return device.images || [];
    } catch (error) {
      console.error('Error parsing images:', error);
      return [];
    }
  };

  const renderStatusBadge = (status) => {
    const badgeStyle = {
      registered: { backgroundColor: '#FFC107', color: '#000' },
      verified: { backgroundColor: '#4CAF50', color: '#fff' },
      rejected: { backgroundColor: '#F44336', color: '#fff' }
    };

    return (
      <View style={[styles.statusBadge, { backgroundColor: badgeStyle[status]?.backgroundColor || '#666' }]}>
        <Text style={[styles.statusText, { color: badgeStyle[status]?.color || '#fff' }]}>
          {status?.toUpperCase() || 'UNKNOWN'}
        </Text>
      </View>
    );
  };

  const renderDeviceCard = (device) => {
    const isExpanded = expandedDevice === device.id;
    const images = parseImages(device);

    return (
      <View key={device.id} style={styles.deviceCard}>
        <TouchableOpacity 
          style={styles.deviceHeader}
          onPress={() => toggleDeviceExpansion(device.id)}
        >
          <View style={styles.deviceHeaderLeft}>
            <Text style={styles.deviceBarcode}>{device.barcode}</Text>
            <Text style={styles.deviceModel}>{device.model}</Text>
            <Text style={styles.deviceSerial}>S/N: {device.serialNumber}</Text>
          </View>
          <View style={styles.deviceHeaderRight}>
            {renderStatusBadge(device.status)}
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.deviceDetails}>
            <Text style={styles.detailsTitle}>Device Details</Text>
            
            {device.description && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>{device.description}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Images:</Text>
              <Text style={styles.detailValue}>{images.length} photos</Text>
            </View>

            {images.length > 0 && (
              <View style={styles.imagesContainer}>
                <Text style={styles.imagesTitle}>Device Photos:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesList}>
                  {images.map((image, index) => (
                    <Image
                      key={image.id || index}
                      source={{ uri: image.data || image.uri }}
                      style={styles.deviceImage}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {device.status === 'registered' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleVerifyDevice(device.id, 'approve')}
                >
                  <Text style={styles.actionButtonText}>✓ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleVerifyDevice(device.id, 'reject')}
                >
                  <Text style={styles.actionButtonText}>✗ Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading devices...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{devices.length}</Text>
          <Text style={styles.statLabel}>Total Devices</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {devices.filter(d => d.status === 'registered').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {devices.filter(d => d.status === 'verified').length}
          </Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by barcode, model, or serial..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
          {['all', 'registered', 'verified', 'rejected'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilter,
                selectedStatus === status && styles.selectedStatusFilter
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[
                styles.statusFilterText,
                selectedStatus === status && styles.selectedStatusFilterText
              ]}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Device List */}
      <ScrollView
        style={styles.devicesList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredDevices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No devices found</Text>
            <TouchableOpacity 
              style={styles.addDeviceButton}
              onPress={() => navigation.navigate('Scanner')}
            >
              <Text style={styles.addDeviceButtonText}>+ Add New Device</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDevices.map(renderDeviceCard)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filtersContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  statusFilters: {
    flexDirection: 'row',
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedStatusFilter: {
    backgroundColor: '#2196F3',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#666',
  },
  selectedStatusFilterText: {
    color: '#fff',
  },
  devicesList: {
    flex: 1,
    padding: 15,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  deviceHeaderLeft: {
    flex: 1,
  },
  deviceHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deviceBarcode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceModel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deviceSerial: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  expandIcon: {
    fontSize: 16,
    color: '#999',
  },
  deviceDetails: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  imagesContainer: {
    marginTop: 15,
  },
  imagesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  imagesList: {
    flexDirection: 'row',
  },
  deviceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  addDeviceButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addDeviceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});