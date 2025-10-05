// screens/UploadScreen.js
import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, TextInput, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../../react-native/services/api';
import secureStorage from '../utils/secureStorage';

export default function UploadScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [formData, setFormData] = useState({
    clerk_id: '',
    clerk_email: '',
    barcode_number: '',
    category: '',
    state: '',
    city: '',
  });

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant media library permission');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        // Automatically extract text from image
        await extractText(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant camera permission');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        // Automatically extract text from image
        await extractText(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const extractText = async (image) => {
    setIsProcessing(true);
    try {
      const result = await apiService.extractText({
        uri: image.uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      if (result.success && result.text) {
        setOcrText(result.text);
        Alert.alert(
          'Text Extracted',
          'OCR text has been extracted successfully!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      Alert.alert('Warning', 'Could not extract text from image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.clerk_id || !formData.clerk_email) {
      Alert.alert('Error', 'Please fill in Clerk ID and Email');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Error', 'Please select or capture an image');
      return;
    }

    setIsProcessing(true);

    try {
      // Upload image first
      const uploadResult = await apiService.uploadImage({
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: `upload_${Date.now()}.jpg`,
      });

      // Prepare data to submit
      const dataToSubmit = {
        clerk_id: formData.clerk_id,
        clerk_email: formData.clerk_email,
        barcode_number: formData.barcode_number || 'MANUAL_UPLOAD',
        ocr_text: ocrText,
        barcode_image: uploadResult.imageUrl,
        category: formData.category,
        state: formData.state,
        city: formData.city,
      };

      // Submit to server with encryption
      const result = await apiService.submitClerkData(dataToSubmit);

      // Store encrypted in device
      await secureStorage.storeClerkData(formData.clerk_id, {
        ...dataToSubmit,
        _id: result.id,
      });

      Alert.alert(
        'Success',
        'Data submitted and stored securely!',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              navigation.navigate('Data');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting data:', error);
      Alert.alert('Error', error.message || 'Failed to submit data');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setOcrText('');
    setFormData({
      clerk_id: '',
      clerk_email: '',
      barcode_number: '',
      category: '',
      state: '',
      city: '',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Image Selection Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Select or Capture Image</Text>
          
          <View style={styles.imageButtonContainer}>
            <Button
              mode="contained"
              onPress={pickImage}
              icon="image"
              style={styles.imageButton}
              disabled={isProcessing}
            >
              Choose Image
            </Button>

            <Button
              mode="contained"
              onPress={takePhoto}
              icon="camera"
              style={styles.imageButton}
              disabled={isProcessing}
            >
              Take Photo
            </Button>
          </View>

          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
              <Button
                mode="text"
                onPress={() => setSelectedImage(null)}
                icon="close"
                compact
              >
                Remove Image
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* OCR Text Display */}
      {ocrText && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.ocrHeader}>
              <Icon name="text-recognition" size={24} color="#6200ee" />
              <Text style={styles.sectionTitle}>Extracted Text</Text>
            </View>
            <Text style={styles.ocrText}>{ocrText}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Form Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Document Details</Text>

          <TextInput
            label="Clerk ID *"
            value={formData.clerk_id}
            onChangeText={(text) => setFormData({ ...formData, clerk_id: text })}
            mode="outlined"
            style={styles.input}
            disabled={isProcessing}
          />

          <TextInput
            label="Clerk Email *"
            value={formData.clerk_email}
            onChangeText={(text) => setFormData({ ...formData, clerk_email: text })}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            disabled={isProcessing}
          />

          <TextInput
            label="Barcode Number"
            value={formData.barcode_number}
            onChangeText={(text) => setFormData({ ...formData, barcode_number: text })}
            mode="outlined"
            style={styles.input}
            disabled={isProcessing}
            placeholder="Leave empty if not applicable"
          />

          <TextInput
            label="Category"
            value={formData.category}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
            mode="outlined"
            style={styles.input}
            disabled={isProcessing}
          />

          <TextInput
            label="State"
            value={formData.state}
            onChangeText={(text) => setFormData({ ...formData, state: text })}
            mode="outlined"
            style={styles.input}
            disabled={isProcessing}
          />

          <TextInput
            label="City"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            mode="outlined"
            style={styles.input}
            disabled={isProcessing}
          />
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={resetForm}
          style={styles.button}
          disabled={isProcessing}
        >
          Reset
        </Button>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          loading={isProcessing}
          disabled={isProcessing || !selectedImage}
        >
          Submit
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imageButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
  },
  imagePreviewContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  ocrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ocrText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  input: {
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    margin: 16,
  },
  button: {
    flex: 1,
  },
  bottomPadding: {
    height: 20,
  },
});