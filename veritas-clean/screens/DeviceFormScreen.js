//react-native/app/screens/DeviceFormScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function DeviceFormScreen({ route, navigation }) {
  const { barcode } = route.params;
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    const device = { barcode, model, serial, description };
    // Pass data through navigation instead of store
    navigation.navigate('ImageCapture', { device });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Device Details</Text>
      
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
          disabled={!model.trim() || !serial.trim()}
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
});