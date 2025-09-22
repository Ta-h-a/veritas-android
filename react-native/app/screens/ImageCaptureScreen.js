import React, { useState } from 'react';
import { View, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import useStore from '../services/store';
import { registerDevice } from '../services/apiService';
import { signData, encryptData } from '../services/cryptoService';

export default function ImageCaptureScreen({ navigation }) {
  const [images, setImages] = useState([]);
  const currentDevice = useStore((state) => state.currentDevice);
  const user = useStore((state) => state.user);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    const deviceData = { ...currentDevice, images };
    const jsonData = JSON.stringify(deviceData);
    const signature = await signData(jsonData);
    const encryptedData = await encryptData(jsonData, 'public_key'); // Placeholder

    await registerDevice({
      encryptedData,
      signature,
      userId: user.id
    });

    navigation.navigate('Success');
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Pick Images" onPress={pickImage} />
      {images.map((uri, index) => (
        <Image key={index} source={{ uri }} style={{ width: 100, height: 100 }} />
      ))}
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}