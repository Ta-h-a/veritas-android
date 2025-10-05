// screens/CameraScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, TextInput, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../services/api';
import secureStorage from '../utils/secureStorage';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    clerk_id: '',
    clerk_email: '',
    category: '',
    state: '',
    city: '',
  });
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (isProcessing || scannedData) return;

    setScannedData(data);
    setIsProcessing(true);

    try {
      // Capture photo of the barcode
      const camera = cameraRef.current;

      if (camera && typeof camera.takePictureAsync === 'function') {
        const photo = await camera.takePictureAsync({
          quality: 0.8,
        });

        if (photo) {
          // Extract text using OCR
          const ocrResult = await apiService.extractText({
            uri: photo.uri,
            type: 'image/jpeg',
            name: 'barcode.jpg',
          });

          Alert.alert(
            'Barcode Scanned',
            `Type: ${type}\nData: ${data}\n\nPlease fill in the details to save.`,
            [{ text: 'OK' }]
          );

          setScannedData({
            barcodeData: data,
            barcodeType: type,
            ocrText: ocrResult.text || '',
            imageUri: photo.uri,
          });
        }
      } else {
        console.warn('Camera reference is unavailable or capture is not supported.');
        Alert.alert('Camera unavailable', 'Unable to capture an image from the camera.');
        setScannedData(null);
        return;
      }
    } catch (error) {
      console.error('Error processing barcode:', error);
      Alert.alert('Error', 'Failed to process barcode scan');
      setScannedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.clerk_id || !formData.clerk_email) {
      Alert.alert('Error', 'Please fill in Clerk ID and Email');
      return;
    }

    if (!scannedData) {
      Alert.alert('Error', 'No barcode data scanned');
      return;
    }

    setIsProcessing(true);

    try {
      // Upload image first
      let imageUrl = '';
      if (scannedData.imageUri) {
        const uploadResult = await apiService.uploadImage({
          uri: scannedData.imageUri,
          type: 'image/jpeg',
          name: `barcode_${Date.now()}.jpg`,
        });
        imageUrl = uploadResult.imageUrl;
      }

      // Prepare data to submit
      const dataToSubmit = {
        clerk_id: formData.clerk_id,
        clerk_email: formData.clerk_email,
        barcode_number: scannedData.barcodeData,
        ocr_text: scannedData.ocrText,
        barcode_image: imageUrl,
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
    setScannedData(null);
    setFormData({
      clerk_id: '',
      clerk_email: '',
      category: '',
      state: '',
      city: '',
    });
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          We need camera permission to scan barcodes
        </Text>
        <Button mode="contained" onPress={requestPermission}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!scannedData ? (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barCodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
            }}
          />

          <View pointerEvents="none" style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanText}>
              {isProcessing ? 'Processing...' : 'Align barcode within the frame'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.infoRow}>
                <Icon name="barcode-scan" size={24} color="#6200ee" />
                <Text style={styles.infoText}>Barcode: {scannedData.barcodeData}</Text>
              </View>
              {scannedData.ocrText && (
                <Text style={styles.ocrText} numberOfLines={3}>
                  OCR: {scannedData.ocrText}
                </Text>
              )}
            </Card.Content>
          </Card>

          <View style={styles.form}>
            <TextInput
              label="Clerk ID *"
              value={formData.clerk_id}
              onChangeText={(text) => setFormData({ ...formData, clerk_id: text })}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Clerk Email *"
              value={formData.clerk_email}
              onChangeText={(text) => setFormData({ ...formData, clerk_email: text })}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Category"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="State"
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text })}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="City"
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={resetForm}
                style={styles.button}
                disabled={isProcessing}
              >
                Scan Again
              </Button>

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={isProcessing}
                disabled={isProcessing}
              >
                Submit
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  infoCard: {
    margin: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  ocrText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    color: '#333',
  },
});