//react-native/app/screens/ScannerScreen.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, Dimensions, Animated } from 'react-native';
import { CameraView, Camera } from 'expo-camera';

const { width, height } = Dimensions.get('window');

export default function ScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  
  // Animation refs
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  // Scanning line animation
  useEffect(() => {
    if (showCamera && !isScanning) {
      const scanAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      scanAnimation.start();
      return () => scanAnimation.stop();
    }
  }, [showCamera, isScanning, scanLineAnim]);

  const handleBarCodeScanned = ({ type, data }) => {
    if (isScanning) return; // Prevent multiple scans
    
    setIsScanning(true);
    setScannedData({ type, data });
    
    // Stop scan line animation and start pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Show success animation for 2 seconds
    setTimeout(() => {
      setScanned(true);
      setShowCamera(false);
      setIsScanning(false);
      setScannedData(null);
      pulseAnim.setValue(1);
      
      Alert.alert(
        'Barcode Scanned Successfully',
        `Type: ${type}\nData: ${data}`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('DeviceForm', { barcode: data })
          },
          {
            text: 'Scan Again',
            onPress: () => {
              setScanned(false);
              setShowCamera(true);
            }
          }
        ]
      );
    }, 2500);
  };

  const handleStartCamera = () => {
    if (hasPermission === null) {
      Alert.alert('Permission Required', 'Requesting camera permission...');
      return;
    }
    if (hasPermission === false) {
      Alert.alert(
        'Camera Access Denied',
        'Please enable camera access in your device settings to scan barcodes.',
        [{ text: 'OK' }]
      );
      return;
    }
    setScanned(false);
    setIsScanning(false);
    setScannedData(null);
    setShowCamera(true);
  };

  const handleManualEntry = () => {
    if (manualBarcode.trim()) {
      navigation.navigate('DeviceForm', { barcode: manualBarcode.trim() });
    } else {
      Alert.alert('Error', 'Please enter a barcode');
    }
  };

  const handleTestBarcode = () => {
    navigation.navigate('DeviceForm', { barcode: 'TEST123456789' });
  };

  if (showCamera) {
    const scanLineTranslateY = scanLineAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 220], // Move across the scan area height
    });

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned || isScanning ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417", "code128", "code39", "code93", "codabar", "ean13", "ean8", "upc_a", "upc_e"],
          }}
        >
          <View style={styles.cameraOverlay}>
            <Animated.View 
              style={[
                styles.scanArea,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
              
              {/* Scanning line animation */}
              {!isScanning && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{ translateY: scanLineTranslateY }]
                    }
                  ]}
                />
              )}
              
              {/* Success indicator */}
              {isScanning && (
                <View style={styles.successOverlay}>
                  <View style={styles.successIndicator}>
                    <Text style={styles.successText}>✓</Text>
                  </View>
                  <Text style={styles.scanningText}>Processing...</Text>
                </View>
              )}
            </Animated.View>
            
            <View style={styles.instructionContainer}>
              {!isScanning ? (
                <>
                  <Text style={styles.instructionText}>
                    Point camera at barcode
                  </Text>
                  <Text style={styles.subInstructionText}>
                    Position barcode within the frame
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.instructionText}>
                    Barcode Detected!
                  </Text>
                  <Text style={styles.subInstructionText}>
                    Type: {scannedData?.type}
                  </Text>
                  <Text style={styles.scannedDataText}>
                    {scannedData?.data}
                  </Text>
                </>
              )}
            </View>
            
            {!isScanning && (
              <View style={styles.cameraButtonContainer}>
                <Button 
                  title="Cancel" 
                  onPress={() => setShowCamera(false)}
                  color="#FF5722"
                />
                <Button 
                  title="Enter Manually" 
                  onPress={() => setShowCamera(false)}
                  color="#2196F3"
                />
              </View>
            )}
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Scanner</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📷 Scan Barcode</Text>
        <Text style={styles.sectionDescription}>
          Use your camera to automatically scan device barcodes
        </Text>
        <Button 
          title="Open Camera Scanner" 
          onPress={handleStartCamera}
          color="#2196F3"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✏️ Enter Manually</Text>
        <Text style={styles.sectionDescription}>
          Type the barcode if camera scanning isn't working
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter barcode number"
          value={manualBarcode}
          onChangeText={setManualBarcode}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Button 
          title="Continue with Barcode" 
          onPress={handleManualEntry}
          color="#2196F3"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Quick Test</Text>
        <Text style={styles.sectionDescription}>
          Use test data for development
        </Text>
        <Button 
          title="Use Test Barcode" 
          onPress={handleTestBarcode}
          color="#4CAF50"
        />
      </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
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
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
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
    marginVertical: 15,
  },
  
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    marginTop: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 25,
    height: 25,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#00FF88',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 25,
    height: 25,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#00FF88',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 25,
    height: 25,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#00FF88',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 25,
    height: 25,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#00FF88',
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  successIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  successText: {
    fontSize: 28,
    color: '#000',
    fontWeight: 'bold',
  },
  scanningText: {
    fontSize: 16,
    color: '#00FF88',
    fontWeight: '600',
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  subInstructionText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 5,
  },
  scannedDataText: {
    fontSize: 16,
    color: '#00FF88',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cameraButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 50,
    gap: 20,
  },
});