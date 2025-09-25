//react-native/app/screens/DeviceFormScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import useStore from '../services/store';

export default function DeviceFormScreen({ route, navigation }) {
  const { barcode } = route.params;
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [description, setDescription] = useState('');
  const setCurrentDevice = useStore((state) => state.setCurrentDevice);

  const handleSave = () => {
    const device = { barcode, model, serial, description };
    setCurrentDevice(device);
    navigation.navigate('ImageCapture');
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Barcode: {barcode}</Text>
      <TextInput placeholder="Model" value={model} onChangeText={setModel} />
      <TextInput placeholder="Serial Number" value={serial} onChangeText={setSerial} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} />
      <Button title="Save and Continue" onPress={handleSave} />
    </View>
  );
}