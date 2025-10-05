// screens/DataListScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Chip, Searchbar, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import secureStorage from '../utils/secureStorage';

export default function DataListScreen({ navigation }) {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await secureStorage.getAllClerkData();
      
      // Sort by most recent first
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.lastAccessed || a.storedAt);
        const dateB = new Date(b.lastAccessed || b.storedAt);
        return dateB - dateA;
      });

      setAllData(sortedData);
      setFilteredData(sortedData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load stored data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredData(allData);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = allData.filter((item) => {
      return (
        item.clerk_id?.toLowerCase().includes(lowercaseQuery) ||
        item.clerk_email?.toLowerCase().includes(lowercaseQuery) ||
        item.barcode_number?.toLowerCase().includes(lowercaseQuery) ||
        item.category?.toLowerCase().includes(lowercaseQuery) ||
        item.state?.toLowerCase().includes(lowercaseQuery) ||
        item.city?.toLowerCase().includes(lowercaseQuery)
      );
    });

    setFilteredData(filtered);
  };

  const handleDelete = async (clerkId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this record from your device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await secureStorage.deleteClerkData(clerkId);
              await loadData();
              Alert.alert('Success', 'Record deleted successfully');
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
            }
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      const backup = await secureStorage.exportBackup();
      // In a real app, you would save this to a file or share it
      Alert.alert(
        'Export Successful',
        `Exported ${allData.length} records.\n\nBackup size: ${(backup.length / 1024).toFixed(2)} KB`,
        [{ text: 'OK' }]
      );
      console.log('Backup data:', backup);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderItem = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('DataDetail', { data: item })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Icon name="barcode" size={20} color="#6200ee" />
            <Text style={styles.barcodeNumber} numberOfLines={1}>
              {item.barcode_number || 'N/A'}
            </Text>
          </View>
          {item.category && (
            <Chip mode="outlined" compact>
              {item.category}
            </Chip>
          )}
        </View>

        <View style={styles.infoRow}>
          <Icon name="account" size={16} color="#666" />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.clerk_email || 'No email'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="identifier" size={16} color="#666" />
          <Text style={styles.infoText} numberOfLines={1}>
            ID: {item.clerk_id}
          </Text>
        </View>

        {(item.state || item.city) && (
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={16} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>
              {[item.city, item.state].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {formatDate(item.lastAccessed || item.storedAt)}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.clerk_id)}
            style={styles.deleteButton}
          >
            <Icon name="delete-outline" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="database-off-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No stored data</Text>
      <Text style={styles.emptySubtext}>
        Scan a barcode or upload an image to get started
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search records..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filteredData.length} of {allData.length} records
        </Text>
        <TouchableOpacity onPress={exportData} style={styles.exportButton}>
          <Icon name="export" size={20} color="#6200ee" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id || `${item.clerk_id}-${index}`}
        contentContainerStyle={[
          styles.listContainer,
          filteredData.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Camera')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  exportText: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  barcodeNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});