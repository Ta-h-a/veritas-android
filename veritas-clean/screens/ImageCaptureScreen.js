//react-native/app/screens/ImageCaptureScreen.js

import React, { useState } from 'react';
import { View, Button, StyleSheet, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { registerDevice } from '../services/apiService';

// Simple UUID generator function
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function ImageCaptureScreen({ route, navigation }) {
  const [imageCount, setImageCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { device } = route.params;

  const simulateImageCapture = () => {
    setImageCount(imageCount + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare device data for API with proper UUID
      const deviceData = {
        encryptedData: JSON.stringify({
          ...device,
          images: [`image_${Date.now()}_1`, `image_${Date.now()}_2`],
          submittedAt: new Date().toISOString()
        }),
        signature: 'temp_signature_' + Date.now(),
        userId: generateUUID() // Generate proper UUID format
      };
      
      console.log('Submitting to API:', deviceData);
      
      // Call your actual API
      const response = await registerDevice(deviceData);
      
      console.log('API Response:', response);
      Alert.alert('Success', 'Device registered successfully!');
      navigation.navigate('Success');
      
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Error', 
        'Failed to submit device. Please check your connection and try again.\n\nError: ' + (error.message || 'Unknown error')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Capture Device Images</Text>
      
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceTitle}>Device Information:</Text>
        <Text>Barcode: {device?.barcode || 'N/A'}</Text>
        <Text>Model: {device?.model || 'N/A'}</Text>
        <Text>Serial: {device?.serial || 'N/A'}</Text>
        {device?.description ? <Text>Description: {device.description}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Images ({imageCount})</Text>
        <Button 
          title="Simulate Image Capture" 
          onPress={simulateImageCapture}
          color="#2196F3"
          disabled={isSubmitting}
        />
        <Text style={styles.note}>
          Image capture will be implemented once native modules are properly configured
        </Text>
      </View>

      <View style={styles.submitSection}>
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Submitting device...</Text>
          </View>
        ) : (
          <Button 
            title="Submit Device Registration" 
            onPress={handleSubmit}
            color="#4CAF50"
          />
        )}
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
  deviceInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  deviceTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  submitSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
});