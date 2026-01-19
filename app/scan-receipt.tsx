import { MenuButton } from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ReceiptsService } from '@/services/api';

export default function ScanReceiptScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Request camera permissions on mount
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');
      } else {
        setHasPermission(true); // Web doesn't need permissions
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web' && !hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
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
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your camera.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
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

  const processReceipt = async () => {
    if (!image) return;
    setIsProcessing(true);
    
    try {
      // Create FormData for image upload
      const formData = new FormData();
      
      // Handle image URI differently for web vs native
      let imageUri = image;
      let imageFile: any;
      
      if (Platform.OS === 'web') {
        // For web, we need to convert the URI to a File/Blob
        // Fetch the image and convert to blob
        const response = await fetch(image);
        const blob = await response.blob();
        const imageName = image.split('/').pop() || 'receipt.jpg';
        imageFile = new File([blob], imageName, { type: blob.type || 'image/jpeg' });
      } else {
        // For React Native (iOS/Android), keep the URI format
        // iOS: Keep file:// prefix
        // Android: Keep as is (can be file:// or content://)
        if (Platform.OS === 'ios' && !imageUri.startsWith('file://')) {
          imageUri = `file://${imageUri}`;
        }
        
        // Get image name from URI
        const imageUriParts = image.split('/');
        const imageName = imageUriParts[imageUriParts.length - 1] || 'receipt.jpg';
        
        // Determine image type
        let imageType = 'image/jpeg';
        if (imageName.toLowerCase().endsWith('.png')) {
          imageType = 'image/png';
        } else if (imageName.toLowerCase().endsWith('.jpg') || imageName.toLowerCase().endsWith('.jpeg')) {
          imageType = 'image/jpeg';
        }
        
        // React Native FormData format
        imageFile = {
          uri: imageUri,
          type: imageType,
          name: imageName,
        };
      }
      
      // Append image file
      formData.append('image', imageFile as any);
      
      // Add required total_amount field (will be updated after OCR extraction)
      // Set to "0.00" as placeholder since OCR will extract the actual amount
      formData.append('total_amount', '0.00');

      console.log('Uploading receipt with image:', { imageUri, imageName, imageType });

      // Step 1: Try upload endpoint first (handles image + OCR)
      let receipt: any;
      try {
        const uploadResponse = await ReceiptsService.uploadReceipt(formData);
        // uploadReceipt returns ReceiptUploadResponse which has receipt property
        receipt = uploadResponse.receipt || uploadResponse;
        console.log('Receipt uploaded:', receipt?.id, 'Items:', receipt?.items?.length || 0);
      } catch (uploadError: any) {
        console.log('Upload endpoint failed, trying create endpoint:', uploadError.response?.data || uploadError.message);
        // Fallback to create endpoint
        receipt = await ReceiptsService.createReceipt(formData);
        console.log('Receipt created:', receipt?.id, 'Items:', receipt?.items?.length || 0);
      }
      
      if (!receipt || !receipt.id) {
        throw new Error('Failed to create receipt. Please try again.');
      }
      
      // Step 2: Trigger OCR extraction if needed
      let finalReceipt = receipt;
      if (!receipt.items || receipt.items.length === 0 || !receipt.is_extracted) {
        try {
          console.log('Triggering OCR extraction for receipt:', receipt.id);
          // Trigger OCR extraction
          const extractResponse = await ReceiptsService.extractReceipt(receipt.id);
          console.log('Extract response:', extractResponse);
          
          // Wait a bit for OCR processing (if async)
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Reload receipt to get extracted items
          finalReceipt = await ReceiptsService.getReceiptById(receipt.id);
          console.log('Receipt after extraction:', finalReceipt.items?.length || 0, 'items');
          
          // If still no items, try one more time after delay
          if ((!finalReceipt.items || finalReceipt.items.length === 0) && extractResponse.extracted) {
            console.log('Retrying receipt load after extraction...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            finalReceipt = await ReceiptsService.getReceiptById(receipt.id);
          }
        } catch (extractError: any) {
          console.warn('OCR extraction error, will retry on review screen:', extractError);
          // Continue - extraction will be retried on review screen
        }
      }
      
      setIsProcessing(false);
      
      // Navigate to review screen with extracted receipt data
      router.push({
        pathname: '/scan-receipt-review',
        params: { 
          receiptId: finalReceipt.id.toString(),
          imageUri: image,
        },
      });
    } catch (error: any) {
      setIsProcessing(false);
      console.error('Error processing receipt:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to process receipt. Please try again.';
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Scan Receipt</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Extract items from receipts automatically
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Instructions Card */}
      <Card variant="elevated" style={styles.instructionCard}>
        <View style={styles.instructionHeader}>
          <MaterialIcons name="info" size={24} color={Colors.info.main} />
          <ThemedText type="subtitle" style={styles.instructionTitle}>
            How it works
          </ThemedText>
        </View>
        <ThemedText style={styles.instructionText}>
          • Take a photo or upload a receipt image{'\n'}
          • Our AI will extract all items automatically{'\n'}
          • Review and confirm the extracted data{'\n'}
          • Items will be added to your transactions
        </ThemedText>
      </Card>

      {/* Image Preview */}
      {image ? (
        <Card variant="elevated" style={styles.imageCard}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => setImage(null)}
          >
            <MaterialIcons name="close" size={20} color={Colors.text.inverse} />
          </TouchableOpacity>
        </Card>
      ) : (
        <Card variant="elevated" style={styles.uploadCard}>
          <MaterialIcons name="receipt-long" size={64} color={Colors.text.tertiary} />
          <ThemedText style={styles.uploadText}>No receipt selected</ThemedText>
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
            Camera and photo library permissions are required to scan receipts.
            Please enable them in your device settings.
          </ThemedText>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryButton,
            hasPermission === false && styles.buttonDisabled
          ]}
          onPress={takePhoto}
          disabled={hasPermission === false}
          activeOpacity={0.7}
        >
          <MaterialIcons name="camera-alt" size={20} color={Colors.text.inverse} />
          <Text style={styles.primaryButtonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.outlineButton,
            hasPermission === false && styles.buttonDisabled
          ]}
          onPress={pickImage}
          disabled={hasPermission === false}
          activeOpacity={0.7}
        >
          <MaterialIcons name="photo-library" size={20} color={Colors.primary[600]} />
          <Text style={styles.outlineButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Process Button */}
      {image && (
        <Card variant="elevated" style={styles.processCard}>
          <Button
            title={isProcessing ? 'Processing...' : 'Process Receipt'}
            variant="primary"
            onPress={processReceipt}
            disabled={isProcessing}
            style={styles.processButton}
          />
          {isProcessing && (
            <ThemedText style={styles.processingText}>
              Extracting items from receipt...
            </ThemedText>
          )}
        </Card>
      )}

      {/* Features */}
      <Card variant="elevated" style={styles.featuresCard}>
        <ThemedText type="subtitle" style={styles.featuresTitle}>
          Features
        </ThemedText>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color={Colors.success.main} />
            <ThemedText style={styles.featureText}>Automatic item extraction</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color={Colors.success.main} />
            <ThemedText style={styles.featureText}>Price and quantity detection</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color={Colors.success.main} />
            <ThemedText style={styles.featureText}>Merchant identification</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color={Colors.success.main} />
            <ThemedText style={styles.featureText}>Smart categorization</ThemedText>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
    backgroundColor: Colors.info.light,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  instructionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  instructionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.base * 1.6,
  },
  uploadCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  uploadText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  uploadSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  imageCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.error.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
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
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  primaryButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  outlineButtonText: {
    color: Colors.primary[600],
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  processCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  processButton: {
    width: '100%',
  },
  processingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  featuresCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    padding: Spacing.lg,
  },
  featuresTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },
  featuresList: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  permissionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.warning.light,
    borderColor: Colors.warning.main,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  permissionText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
});
