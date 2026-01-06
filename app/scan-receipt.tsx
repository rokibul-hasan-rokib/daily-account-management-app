import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import * as ImagePicker from 'expo-image-picker'; // Install expo-image-picker for full functionality

export default function ScanReceiptScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pickImage = async () => {
    // TODO: Install expo-image-picker: npx expo install expo-image-picker
    alert('Image picker functionality coming soon! Install expo-image-picker for full functionality.');
    // Placeholder for demo
    setImage('https://via.placeholder.com/400x300');
  };

  const takePhoto = async () => {
    // TODO: Install expo-image-picker: npx expo install expo-image-picker
    alert('Camera functionality coming soon! Install expo-image-picker for full functionality.');
    // Placeholder for demo
    setImage('https://via.placeholder.com/400x300');
  };

  const processReceipt = async () => {
    if (!image) return;
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      // Navigate to review screen with image
      router.push({
        pathname: '/scan-receipt-review',
        params: { imageUri: image },
      });
    }, 2000);
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

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Take Photo"
          variant="primary"
          onPress={takePhoto}
          style={styles.actionButton}
        />
        <Button
          title="Choose from Gallery"
          variant="outline"
          onPress={pickImage}
          style={styles.actionButton}
        />
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
});
