//react-native/app/screens/ImageCaptureScreen.js

import React, { useState } from 'react';
import { View, Button, StyleSheet, Text, ScrollView, Alert, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { registerDevice } from '../services/apiService';

// Simple UUID generator function
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function ImageCaptureScreen({ route, navigation }) {
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { device } = route.params;

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access to save images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Add Image',
      'Choose how to add the device image:',
      [
        {
          text: 'Take Photo',
          onPress: openCamera,
        },
        {
          text: 'Choose from Gallery',
          onPress: openImageLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      addImage(result.assets[0]);
    }
  };

  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      addImage(result.assets[0]);
    }
  };

  const addImage = (imageAsset) => {
    const newImage = {
      id: generateUUID(),
      uri: imageAsset.uri,
      width: imageAsset.width,
      height: imageAsset.height,
      timestamp: new Date().toISOString(),
    };
    setImages([...images, newImage]);
  };

  const removeImage = (imageId) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setImages(images.filter(img => img.id !== imageId));
          },
        },
      ]
    );
  };

  
  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert(
        'No Images',
        'Please capture at least one image of the device before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare device data for API with real images
      const deviceData = {
        encryptedData: JSON.stringify({
          ...device,
          images: images.map(img => ({
            id: img.id,
            uri: img.uri,
            timestamp: img.timestamp,
            width: img.width,
            height: img.height
          })),
          submittedAt: new Date().toISOString()
        }),
        signature: 'temp_signature_' + Date.now(),
        userId: generateUUID()
      };
      
      console.log('Submitting to API with', images.length, 'images');
      
      // Call your actual API
      const response = await registerDevice(deviceData);
      
      console.log('API Response:', response);
      Alert.alert('Success', `Device registered successfully with ${images.length} images!`);
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
        <Text style={styles.deviceText}>Barcode: {device?.barcode || 'N/A'}</Text>
        <Text style={styles.deviceText}>Model: {device?.model || 'N/A'}</Text>
        <Text style={styles.deviceText}>Serial: {device?.serial || 'N/A'}</Text>
        {device?.description ? <Text style={styles.deviceText}>Description: {device.description}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Images ({images.length})</Text>
        <Text style={styles.sectionDescription}>
          Take photos of the device from different angles
        </Text>
        
        <Button 
          title="📷 Add Image" 
          onPress={takePhoto}
          color="#2196F3"
          disabled={isSubmitting}
        />
        
        {images.length > 0 && (
          <View style={styles.imageGrid}>
            {images.map((image, index) => (
              <TouchableOpacity 
                key={image.id} 
                style={styles.imageContainer}
                onPress={() => removeImage(image.id)}
              >
                <Image source={{ uri: image.uri }} style={styles.thumbnail} />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageNumber}>{index + 1}</Text>
                  <Text style={styles.removeText}>Tap to remove</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {images.length === 0 && (
          <Text style={styles.noImagesText}>
            No images captured yet. Take at least one photo to continue.
          </Text>
        )}
      </View>

      <View style={styles.submitSection}>
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Submitting device with {images.length} images...</Text>
          </View>
        ) : (
          <Button 
            title={`Submit Device Registration (${images.length} images)`}
            onPress={handleSubmit}
            color="#4CAF50"
            disabled={images.length === 0}
          />
        )}
      </View>
    </ScrollView>
  );
}

// Add this function to your ImageCaptureScreen.js

const convertImageToBase64 = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Update your handleSubmit function:
const handleSubmit = async () => {
  if (images.length === 0) {
    Alert.alert('No Images', 'Please capture at least one image...');
    return;
  }

  setIsSubmitting(true);
  
  try {
    // Convert all images to base64
    const base64Images = await Promise.all(
      images.map(async (img) => {
        const base64 = await convertImageToBase64(img.uri);
        return {
          id: img.id,
          data: base64, // This contains the actual image data
          timestamp: img.timestamp,
          width: img.width,
          height: img.height
        };
      })
    );

    const deviceData = {
      encryptedData: JSON.stringify({
        ...device,
        images: base64Images, // Send actual image data
        submittedAt: new Date().toISOString()
      }),
      signature: 'temp_signature_' + Date.now(),
      userId: generateUUID()
    };
    
    console.log('Submitting device with', images.length, 'images (base64 encoded)');
    
    const response = await registerDevice(deviceData);
    console.log('API Response:', response);
    
    Alert.alert('Success', `Device registered with ${images.length} images uploaded!`);
    navigation.navigate('Success');
    
  } catch (error) {
    console.error('Submission error:', error);
    Alert.alert('Error', 'Failed to upload images. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deviceTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  deviceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    gap: 10,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  imageNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  removeText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
  noImagesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 15,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
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
    textAlign: 'center',
  },
});