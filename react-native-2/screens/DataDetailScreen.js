// screens/DataDetailScreen.js
import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Share,
} from 'react-native';
import { Card, Button, Divider, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import secureStorage from '../utils/secureStorage';

export default function DataDetailScreen({ route, navigation }) {
  const { data } = route.params;
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this record from your device? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await secureStorage.deleteClerkData(data.clerk_id);
              Alert.alert('Success', 'Record deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const shareData = {
        clerk_id: data.clerk_id,
        clerk_email: data.clerk_email,
        barcode_number: data.barcode_number,
        category: data.category,
        state: data.state,
        city: data.city,
        date: formatDate(data.storedAt),
      };

      const message = Object.entries(shareData)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      await Share.share({
        message: `Veritas Data Record\n\n${message}`,
        title: 'Share Record',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const InfoRow = ({ icon, label, value, valueStyle }) => {
    if (!value) return null;
    
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoLabel}>
          <Icon name={icon} size={20} color="#6200ee" />
          <Text style={styles.labelText}>{label}</Text>
        </View>
        <Text style={[styles.valueText, valueStyle]} selectable>
          {value}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Icon name="barcode-scan" size={48} color="#6200ee" />
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>
                {data.barcode_number || 'No Barcode'}
              </Text>
              {data.category && (
                <Chip mode="flat" style={styles.categoryChip}>
                  {data.category}
                </Chip>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Image Card */}
      {data.barcode_image && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Barcode Image</Text>
            <Image
              source={{ uri: data.barcode_image }}
              style={styles.image}
              resizeMode="contain"
            />
          </Card.Content>
        </Card>
      )}

      {/* Details Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Record Details</Text>
          <Divider style={styles.divider} />

          <InfoRow
            icon="identifier"
            label="Clerk ID"
            value={data.clerk_id}
            valueStyle={styles.boldValue}
          />

          <InfoRow
            icon="email"
            label="Email"
            value={data.clerk_email}
          />

          <InfoRow
            icon="barcode"
            label="Barcode Number"
            value={data.barcode_number}
          />

          <InfoRow
            icon="tag"
            label="Category"
            value={data.category}
          />

          <InfoRow
            icon="map-marker"
            label="State"
            value={data.state}
          />

          <InfoRow
            icon="city"
            label="City"
            value={data.city}
          />
        </Card.Content>
      </Card>

      {/* OCR Text Card */}
      {data.ocr_text && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.ocrHeader}>
              <Icon name="text-recognition" size={24} color="#6200ee" />
              <Text style={styles.sectionTitle}>Extracted Text</Text>
            </View>
            <Divider style={styles.divider} />
            <Text style={styles.ocrText} selectable>
              {data.ocr_text}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Metadata Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Metadata</Text>
          <Divider style={styles.divider} />

          <InfoRow
            icon="calendar-plus"
            label="Stored At"
            value={formatDate(data.storedAt)}
          />

          <InfoRow
            icon="calendar-clock"
            label="Last Accessed"
            value={formatDate(data.lastAccessed)}
          />

          {data._id && (
            <InfoRow
              icon="key"
              label="Record ID"
              value={data._id}
              valueStyle={styles.monoValue}
            />
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          mode="outlined"
          onPress={handleShare}
          icon="share-variant"
          style={styles.actionButton}
        >
          Share
        </Button>

        <Button
          mode="contained"
          onPress={handleDelete}
          icon="delete"
          style={[styles.actionButton, styles.deleteButton]}
          buttonColor="#f44336"
          loading={isDeleting}
          disabled={isDeleting}
        >
          Delete
        </Button>
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerInfo: {
    flex: 1,
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 28,
  },
  boldValue: {
    fontWeight: '600',
  },
  monoValue: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  ocrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ocrText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    margin: 16,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: '#f44336',
  },
  bottomPadding: {
    height: 20,
  },
});