//react-native/app/screens/ScannerScreen.js

import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';

export default function ScannerScreen({ navigation }) {
  const [manualBarcode, setManualBarcode] = useState('');

  const handleManualEntry = () => {
    if (manualBarcode.trim()) {
      navigation.navigate('DeviceForm', { barcode: manualBarcode.trim() });
    } else {
      Alert.alert('Error', 'Please enter a barcode');
    }
  };

  const handleTestBarcode = () => {
    // Use a test barcode for development
    navigation.navigate('DeviceForm', { barcode: 'TEST123456789' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Scanner</Text>
      
      {/* Manual barcode entry for now */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enter Barcode Manually</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter barcode number"
          value={manualBarcode}
          onChangeText={setManualBarcode}
          autoCapitalize="characters"
        />
        <Button 
          title="Continue with Barcode" 
          onPress={handleManualEntry}
          color="#2196F3"
        />
      </View>

      <View style={styles.divider} />

      {/* Test button for development */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Test</Text>
        <Button 
          title="Use Test Barcode" 
          onPress={handleTestBarcode}
          color="#4CAF50"
        />
      </View>

      <Text style={styles.note}>
        Camera scanning will be added once expo-camera is installed
      </Text>
    </View>
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
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});