import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuButton } from '@/components/menu-button';
import { Colors, Spacing, Typography } from '@/constants/design-system';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { InvoicesService } from '@/services/api';
import { apiClient } from '@/services/api';
import { useInvoices } from '@/contexts/invoices-context';

export default function AddInvoiceScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { getInvoiceById, extractInvoice } = useInvoices();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');
      } else {
        setHasPermission(true);
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web' && !hasPermission) {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS !== 'web' && !hasPermission) {
        Alert.alert('Permission Required', 'Please grant permission to access your camera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const processInvoice = async () => {
    if (!image) return;
    setIsProcessing(true);

    try {
      // Create FormData for image upload
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageName = image.split('/').pop() || 'invoice.jpg';
        const imageType = blob.type || 'image/jpeg';
        const imageFile = new File([blob], imageName, { type: imageType });
        formData.append('image', imageFile);
      } else {
        const imageUriParts = image.split('/');
        const imageName = imageUriParts[imageUriParts.length - 1] || 'invoice.jpg';
        let imageType = 'image/jpeg';
        const lowerName = imageName.toLowerCase();
        if (lowerName.endsWith('.png')) imageType = 'image/png';
        formData.append('image', {
          uri: image,
          type: imageType,
          name: imageName,
        } as any);
      }

      formData.append('total_amount', '0.00');

      console.log('Uploading invoice image...');

      // Upload the invoice image via a generic POST (since there's no dedicated upload endpoint)
      // We'll use the detail endpoint with FormData
      const uploadResponse = await apiClient.postFormData<any>(
        '/invoices/',
        formData
      );

      let invoice: any = uploadResponse.invoice || uploadResponse;
      console.log('Invoice created:', invoice?.id);

      if (!invoice || !invoice.id) {
        throw new Error('Failed to create invoice. Please try again.');
      }

      // Trigger OCR extraction
      let finalInvoice = invoice;
      try {
        console.log('Triggering OCR extraction for invoice:', invoice.id);
        const extractResponse = await InvoicesService.extractInvoice(invoice.id);
        console.log('Extract response:', extractResponse);

        if (extractResponse.extracted) {
          finalInvoice = await InvoicesService.getInvoiceById(invoice.id);
        }
      } catch (extractError: any) {
        console.warn('OCR extraction error:', extractError);
        // Continue - user can manually extract later
      }

      setIsProcessing(false);

      // Navigate to invoice detail screen
      router.push({
        pathname: '/invoices/[id]',
        params: { id: finalInvoice.id.toString() },
      } as any);
    } catch (error: any) {
      setIsProcessing(false);
      console.error('Error processing invoice:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to process invoice.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Upload Invoice</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Extract data from invoices automatically
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <Card variant="elevated" style={styles.instructionCard}>
        <View style={styles.instructionHeader}>
          <MaterialIcons name="info" size={24} color={Colors.info.main} />
          <ThemedText type="subtitle" style={styles.instructionTitle}>How it works</ThemedText>
        </View>
        <ThemedText style={styles.instructionText}>
          • Take a photo or upload an invoice image{'\n'}
          • Our AI will extract all items automatically{'\n'}
          • Review and confirm the extracted data{'\n'}
          • Finalize to create transactions from the invoice
        </ThemedText>
      </Card>

      {/* Image Preview */}
      {image ? (
        <Card variant="elevated" style={styles.imageCard}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity style={styles.removeButton} onPress={() => setImage(null)}>
            <MaterialIcons name="close" size={20} color={Colors.text.inverse} />
          </TouchableOpacity>
        </Card>
      ) : (
        <Card variant="elevated" style={styles.uploadCard}>
          <MaterialIcons name="description" size={64} color={Colors.text.tertiary} />
          <ThemedText style={styles.uploadText}>No invoice selected</ThemedText>
          <ThemedText style={styles.uploadSubtext}>
            Take a photo or choose from gallery
          </ThemedText>
        </Card>
      )}

      {/* Permission Warning */}
      {hasPermission === false && (
        <Card variant="outlined" style={styles.permissionCard}>
          <MaterialIcons name="warning" size={24} color={Colors.warning.main} />
          <ThemedText style={styles.permissionText}>
            Camera and photo library permissions are required to scan invoices.
            Please enable them in your device settings.
          </ThemedText>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton, hasPermission === false && styles.buttonDisabled]}
          onPress={takePhoto}
          disabled={hasPermission === false}
          activeOpacity={0.7}
        >
          <MaterialIcons name="camera-alt" size={20} color={Colors.text.inverse} />
          <Text style={styles.primaryButtonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.outlineButton, hasPermission === false && styles.buttonDisabled]}
          onPress={pickImage}
          disabled={hasPermission === false}
          activeOpacity={0.7}
        >
          <MaterialIcons name="photo-library" size={20} color={Colors.primary[500]} />
          <Text style={styles.outlineButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Process Button */}
      {image && (
        <View style={styles.processContainer}>
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={Colors.primary[500]} />
              <ThemedText style={styles.processingText}>
                Processing invoice...{'\n'}This may take a moment
              </ThemedText>
            </View>
          ) : (
            <Button
              title="Process Invoice"
              variant="primary"
              onPress={processInvoice}
              style={styles.processButton}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  instructionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  instructionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  instructionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * 1.8,
  },
  imageCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  uploadText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  uploadSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  permissionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  permissionText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.warning.dark,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
  },
  outlineButton: {
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  outlineButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  processContainer: {
    paddingHorizontal: Spacing.lg,
  },
  processButton: {
    width: '100%',
  },
  processingContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  processingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
