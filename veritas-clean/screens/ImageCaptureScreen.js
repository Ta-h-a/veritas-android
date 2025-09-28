//react-native/app/screens/ImageCaptureScreen.js

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Button,
  StyleSheet,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import KnoxSdk from 'knox-sdk';
import { registerDevice } from '../services/apiService';
import useKnox from '../hooks/useKnox';
import {
  KnoxStatusBadge,
  SecurityLevelIndicator,
  ComplianceScore,
} from '../components/knox';
import { signData } from '../services/cryptoService';

const generateUUID = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const convertImageToBase64 = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const buildComplianceBanner = ({ hasErrors, hasWarnings, errors, warnings }) => {
  if (hasErrors) {
    return {
      tone: 'error',
      title: 'Capture blocked by compliance',
      body: `Resolve ${errors.length} critical Knox issue${errors.length > 1 ? 's' : ''} before uploading evidence.`,
    };
  }

  if (hasWarnings) {
    return {
      tone: 'warning',
      title: 'Capturing in degraded mode',
      body: `Knox reported ${warnings.length} warning${warnings.length > 1 ? 's' : ''}. Images will be flagged for extra review.`,
    };
  }

  return null;
};

export default function ImageCaptureScreen({ route, navigation }) {
  const { device } = route.params;
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingImageId, setProcessingImageId] = useState(null);

  const {
    isKnoxEnabled,
    securityLevel,
    complianceScore,
    warnings,
    errors,
    logKnoxEvent,
  } = useKnox();

  const hasComplianceErrors = errors.length > 0;
  const hasComplianceWarnings = !hasComplianceErrors && warnings.length > 0;

  const complianceBanner = useMemo(
    () =>
      buildComplianceBanner({
        hasErrors: hasComplianceErrors,
        hasWarnings: hasComplianceWarnings,
        errors,
        warnings,
      }),
    [errors, warnings, hasComplianceErrors, hasComplianceWarnings],
  );

  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is required to capture evidence.');
      await logKnoxEvent('IMAGE_CAPTURE_PERMISSION_DENIED', { status });
      return false;
    }

    const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (libraryStatus.status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access is required to save evidence.');
      await logKnoxEvent('IMAGE_CAPTURE_LIBRARY_DENIED', { status: libraryStatus.status });
      return false;
    }

    return true;
  }, [logKnoxEvent]);

  const secureEnvelope = useCallback(
    async (payload, metadata) => {
      let encryptedPayload = payload;
      let signature = null;
      let encryptionStatus = 'STANDARD';

      try {
        if (isKnoxEnabled) {
          const serialized = JSON.stringify({ payload, metadata });
          encryptedPayload = await KnoxSdk.encryptData(serialized);
          signature = await KnoxSdk.signData(encryptedPayload);
          encryptionStatus = 'KNOX';
        } else {
          const serialized = JSON.stringify({ payload, metadata });
          signature = await signData(serialized);
          encryptionStatus = 'FALLBACK';
        }
      } catch (error) {
        console.warn('Knox encryption failure, falling back to standard payload.', error?.message);
        encryptedPayload = payload;
        signature = null;
        encryptionStatus = 'FALLBACK_ERROR';
      }

      return { encryptedPayload, signature, encryptionStatus };
    },
    [isKnoxEnabled],
  );

  const addImage = useCallback(
    async (asset, source) => {
      const id = generateUUID();
      setProcessingImageId(id);

      try {
        const base64 = await convertImageToBase64(asset.uri);
        const metadata = {
          id,
          timestamp: new Date().toISOString(),
          width: asset.width,
          height: asset.height,
          source,
          deviceBarcode: device?.barcode,
        };

        const { encryptedPayload, signature, encryptionStatus } = await secureEnvelope(base64, metadata);

        const imageRecord = {
          id,
          previewUri: asset.uri,
          metadata,
          payload: encryptedPayload,
          signature,
          encryptionStatus,
        };

        setImages((prev) => [...prev, imageRecord]);
        await logKnoxEvent('IMAGE_CAPTURE_ADDED', {
          imageId: id,
          encryptionStatus,
          signaturePresent: Boolean(signature),
        });
      } catch (error) {
        console.error('Image processing failed:', error);
        Alert.alert('Capture Failed', 'Unable to secure image. Please try again.');
        await logKnoxEvent('IMAGE_CAPTURE_FAILED', { message: error?.message });
      } finally {
        setProcessingImageId(null);
      }
    },
    [device?.barcode, logKnoxEvent, secureEnvelope],
  );

  const openCamera = useCallback(async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      await addImage(result.assets[0], 'camera');
    }
  }, [addImage]);

  const openImageLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      await addImage(result.assets[0], 'library');
    }
  }, [addImage]);

  const takePhoto = useCallback(async () => {
    if (processingImageId) {
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert('Add Evidence', 'Choose how to add device imagery', [
      { text: 'Take Photo', onPress: openCamera },
      { text: 'Choose from Gallery', onPress: openImageLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [openCamera, openImageLibrary, processingImageId, requestPermissions]);

  const removeImage = useCallback(
    (imageId) => {
      Alert.alert('Remove Evidence', 'Delete this secured image?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setImages((prev) => prev.filter((img) => img.id !== imageId));
            await logKnoxEvent('IMAGE_CAPTURE_REMOVED', { imageId });
          },
        },
      ]);
    },
    [logKnoxEvent],
  );

  const handleSubmit = useCallback(async () => {
    if (!images.length) {
      Alert.alert('No Images', 'Capture at least one Knox-secured image before submitting.');
      return;
    }

    if (hasComplianceErrors) {
      Alert.alert('Compliance Required', 'Resolve Knox compliance issues before submitting evidence.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        device,
        images: images.map((image) => ({
          id: image.id,
          metadata: image.metadata,
          payload: image.payload,
          signature: image.signature,
          encryptionStatus: image.encryptionStatus,
        })),
        submittedAt: new Date().toISOString(),
      };

      await logKnoxEvent('DEVICE_REGISTRATION_SUBMIT', {
        deviceId: device?.id,
        imageCount: images.length,
      });

      const response = await registerDevice(payload);

      await logKnoxEvent('DEVICE_REGISTRATION_SUCCESS', {
        deviceId: device?.id,
        imageCount: images.length,
        response,
      });

      navigation.navigate('Success', {
        summary: {
          deviceRegistered: true,
          knoxSecured: isKnoxEnabled,
          encryptionLevel: securityLevel,
          complianceScore: Math.round(complianceScore),
          auditEventsLogged: images.length + 2,
          recommendedActions: warnings,
        },
      });
    } catch (error) {
      console.error('Submission error:', error);
      await logKnoxEvent('DEVICE_REGISTRATION_FAILED', { message: error?.message });
      Alert.alert('Submission Failed', error?.message || 'Failed to submit device data.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    complianceScore,
    device,
    hasComplianceErrors,
    images,
    isKnoxEnabled,
    logKnoxEvent,
    navigation,
    securityLevel,
    warnings,
  ]);

  const renderImageCard = useCallback(
    (image, index) => (
      <TouchableOpacity
        key={image.id}
        style={styles.imageContainer}
        onPress={() => removeImage(image.id)}
      >
        <Image source={{ uri: image.previewUri }} style={styles.thumbnail} />
        <View style={styles.imageOverlay}>
          <Text style={styles.imageNumber}>#{index + 1}</Text>
          <Text style={styles.imageMeta}>{image.metadata.source === 'camera' ? 'Camera' : 'Library'}</Text>
          <Text style={styles.imageStatus}>{image.encryptionStatus}</Text>
          <Text style={styles.removeText}>Tap to remove</Text>
        </View>
      </TouchableOpacity>
    ),
    [removeImage],
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.knoxHeader}>
        <View style={styles.knoxHeaderRow}>
          <KnoxStatusBadge knoxEnabled={isKnoxEnabled} securityLevel={securityLevel} size="small" />
          <View style={styles.complianceScorePill}>
            <Text style={styles.complianceScoreText}>Compliance {Math.round(complianceScore)}%</Text>
          </View>
        </View>
        <View style={styles.knoxHeaderRowLast}>
          <SecurityLevelIndicator securityLevel={securityLevel} compact />
          <ComplianceScore score={Math.round(complianceScore)} warnings={warnings} errors={errors} showDetail={false} />
        </View>
      </View>

      {complianceBanner ? (
        <View
          style={[
            styles.complianceBanner,
            complianceBanner.tone === 'error' ? styles.complianceBannerError : styles.complianceBannerWarning,
          ]}
        >
          <Text style={styles.complianceBannerTitle}>{complianceBanner.title}</Text>
          <Text style={styles.complianceBannerText}>{complianceBanner.body}</Text>
        </View>
      ) : null}

      <Text style={styles.title}>Capture Device Evidence</Text>

      <View style={styles.deviceInfo}>
        <Text style={styles.deviceTitle}>Device Information</Text>
        <Text style={styles.deviceText}>Barcode: {device?.barcode || 'N/A'}</Text>
        <Text style={styles.deviceText}>Model: {device?.model || 'N/A'}</Text>
        <Text style={styles.deviceText}>Serial: {device?.serialNumber || device?.serial || 'N/A'}</Text>
        {device?.description ? (
          <Text style={styles.deviceText}>Description: {device.description}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Secured Images</Text>
          <Text style={styles.sectionCount}>({images.length})</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Capture high-quality photos from multiple angles. Images are encrypted and signed with Knox.
        </Text>

        <Button
          title={processingImageId ? 'Processing image...' : '📷 Add Image'}
          onPress={takePhoto}
          color="#2563eb"
          disabled={isSubmitting || processingImageId || hasComplianceErrors}
        />

        {processingImageId ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.processingText}>Securing image with Knox...</Text>
          </View>
        ) : null}

        {images.length > 0 ? (
          <View style={styles.imageGrid}>{images.map(renderImageCard)}</View>
        ) : (
          <Text style={styles.noImagesText}>No secured images yet. Tap “Add Image” to capture evidence.</Text>
        )}
      </View>

      <View style={styles.submitSection}>
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>Submitting secured payload...</Text>
          </View>
        ) : (
          <Button
            title={`Submit Device Registration (${images.length} images)`}
            onPress={handleSubmit}
            color="#16a34a"
            disabled={!images.length || hasComplianceErrors}
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
  knoxHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  knoxHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  knoxHeaderRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  complianceScorePill: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 12,
  },
  complianceScoreText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  complianceBanner: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
  },
  complianceBannerError: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.32)',
  },
  complianceBannerWarning: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.32)',
  },
  complianceBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  complianceBannerText: {
    fontSize: 12,
    color: '#374151',
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionCount: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  processingText: {
    marginLeft: 10,
    color: '#2563eb',
    fontSize: 13,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  imageContainer: {
    position: 'relative',
    width: 110,
    height: 110,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  imageNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  imageMeta: {
    color: '#e2e8f0',
    fontSize: 12,
    marginBottom: 2,
  },
  imageStatus: {
    color: '#cbd5f5',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  removeText: {
    color: '#f8fafc',
    fontSize: 11,
  },
  noImagesText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 16,
  },
  submitSection: {
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#475569',
  },
});