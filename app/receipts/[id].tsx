import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing } from '@/constants/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useReceipts } from '@/contexts/receipts-context';
import { ReceiptsService } from '@/services/api';
import { Receipt } from '@/services/api/types';

export default function ReceiptDetailScreen() {
  const params = useLocalSearchParams();
  const receiptId = parseInt(params.id as string);
  const { deleteReceipt, extractReceipt } = useReceipts();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    loadReceipt();
  }, [receiptId]);

  const loadReceipt = async () => {
    try {
      setIsLoading(true);
      const data = await ReceiptsService.getReceiptById(receiptId);
      setReceipt(data);
    } catch (error: any) {
      console.error('Error loading receipt:', error);
      Alert.alert('Error', 'Failed to load receipt details.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async () => {
    try {
      setIsExtracting(true);
      await extractReceipt(receiptId);
      await loadReceipt(); // Reload to get updated data
      Alert.alert('Success', 'Receipt data extracted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to extract receipt data');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReceipt(receiptId);
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete receipt');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <ThemedText style={styles.loadingText}>Loading receipt...</ThemedText>
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={48} color={Colors.error.main} />
        <ThemedText style={styles.loadingText}>Receipt not found</ThemedText>
        <Button title="Go Back" variant="primary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <View>
              <ThemedText type="title" style={styles.headerTitle}>Receipt Details</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {receipt.vendor_name || 'Unknown Vendor'}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={handleDelete}>
            <MaterialIcons name="delete" size={24} color={Colors.error.main} />
          </TouchableOpacity>
        </View>

        {/* Receipt Image */}
        {receipt.image && (
          <Card variant="elevated" style={styles.imageCard}>
            <Image source={{ uri: receipt.image }} style={styles.receiptImage} resizeMode="contain" />
          </Card>
        )}

        {/* Receipt Info */}
        <Card variant="elevated" style={styles.infoCard}>
          <ThemedText style={styles.cardTitle}>Receipt Information</ThemedText>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Vendor</ThemedText>
              <ThemedText style={styles.infoValue}>{receipt.vendor_name || 'Unknown'}</ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Date</ThemedText>
              <ThemedText style={styles.infoValue}>
                {receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString() : 'N/A'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Total Amount</ThemedText>
              <ThemedText style={styles.amountValue}>
                £{parseFloat(receipt.total_amount || '0').toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Tax Amount</ThemedText>
              <ThemedText style={styles.infoValue}>
                £{parseFloat(receipt.tax_amount || '0').toFixed(2)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Status</ThemedText>
              <View style={[
                styles.statusBadge,
                { backgroundColor: receipt.is_extracted ? Colors.success.light : Colors.warning.light }
              ]}>
                <ThemedText style={[
                  styles.statusText,
                  { color: receipt.is_extracted ? Colors.success.dark : Colors.warning.dark }
                ]}>
                  {receipt.is_extracted ? 'Extracted' : 'Pending Extraction'}
                </ThemedText>
              </View>
            </View>
            {receipt.extraction_confidence !== undefined && receipt.extraction_confidence !== null && (
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Confidence</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {(receipt.extraction_confidence * 100).toFixed(0)}%
                </ThemedText>
              </View>
            )}
          </View>

          {!receipt.is_extracted && (
            <Button
              title={isExtracting ? 'Extracting...' : 'Extract Data (OCR)'}
              variant="primary"
              onPress={handleExtract}
              disabled={isExtracting}
              style={styles.extractButton}
            />
          )}
        </Card>

        {/* Items */}
        {receipt.items && receipt.items.length > 0 && (
          <Card variant="elevated" style={styles.itemsCard}>
            <ThemedText style={styles.cardTitle}>
              Items ({receipt.items.length})
            </ThemedText>

            {receipt.items.map((item, index) => (
              <View
                key={item.id || index}
                style={[styles.itemRow, index < receipt.items.length - 1 && styles.itemBorder]}
              >
                <View style={styles.itemLeft}>
                  <ThemedText style={styles.itemName}>{item.item_name}</ThemedText>
                  <ThemedText style={styles.itemMeta}>
                    Qty: {item.quantity} × £{parseFloat(item.unit_price || '0').toFixed(2)}
                  </ThemedText>
                  {item.category_name && (
                    <ThemedText style={styles.itemCategory}>{item.category_name}</ThemedText>
                  )}
                </View>
                <ThemedText style={styles.itemTotal}>
                  £{parseFloat(item.total_price || '0').toFixed(2)}
                </ThemedText>
              </View>
            ))}
          </Card>
        )}

        {/* Timestamps */}
        <Card variant="elevated" style={styles.timestampCard}>
          <View style={styles.timestampRow}>
            <ThemedText style={styles.timestampLabel}>Created</ThemedText>
            <ThemedText style={styles.timestampValue}>
              {receipt.created_at ? new Date(receipt.created_at).toLocaleString() : 'N/A'}
            </ThemedText>
          </View>
          <View style={styles.timestampRow}>
            <ThemedText style={styles.timestampLabel}>Updated</ThemedText>
            <ThemedText style={styles.timestampValue}>
              {receipt.updated_at ? new Date(receipt.updated_at).toLocaleString() : 'N/A'}
            </ThemedText>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[50],
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
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
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  imageCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  receiptImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  amountValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  extractButton: {
    marginTop: Spacing.md,
  },
  itemsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  itemMeta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  itemCategory: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary[500],
    marginTop: 2,
  },
  itemTotal: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  timestampCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  timestampLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  timestampValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
  },
});
