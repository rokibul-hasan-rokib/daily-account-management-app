import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Colors, Typography, Spacing } from '@/constants/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useInvoices } from '@/contexts/invoices-context';
import { InvoicesService } from '@/services/api';
import { Invoice, InvoiceItem } from '@/services/api/types';
import { finalizeInvoiceAndCreateTransaction } from '@/services/api/invoice-helpers';

export default function InvoiceDetailScreen() {
  const params = useLocalSearchParams();
  const invoiceId = parseInt(params.id as string);
  const { extractInvoice, finalizeInvoice, getInvoiceById } = useInvoices();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setIsLoading(true);
      const data = await getInvoiceById(invoiceId);
      setInvoice(data);
    } catch (error: any) {
      console.error('Error loading invoice:', error);
      Alert.alert('Error', 'Failed to load invoice details.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async () => {
    try {
      setIsExtracting(true);
      await extractInvoice(invoiceId);
      await loadInvoice();
      Alert.alert('Success', 'Invoice data extracted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to extract invoice data');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFinalize = async () => {
    if (!invoice) return;

    Alert.alert(
      'Finalize Invoice',
      'This will finalize the invoice. Do you also want to create a transaction for this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finalize Only',
          onPress: async () => {
            try {
              setIsFinalizing(true);
              await finalizeInvoice(invoiceId);
              await loadInvoice();
              Alert.alert('Success', 'Invoice finalized successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to finalize invoice');
            } finally {
              setIsFinalizing(false);
            }
          },
        },
        {
          text: 'Finalize & Create Transaction',
          onPress: async () => {
            try {
              setIsFinalizing(true);
              await finalizeInvoiceAndCreateTransaction(
                invoiceId,
                {
                  vendor_name: invoice.vendor_name,
                  invoice_date: invoice.invoice_date,
                  total_amount: invoice.total_amount,
                  tax_amount: invoice.tax_amount,
                },
                {
                  amount: invoice.total_amount || '0.00',
                  date: invoice.invoice_date || new Date().toISOString().split('T')[0],
                  category: 1, // Default category
                  description: `Invoice from ${invoice.vendor_name || 'Unknown Vendor'}`,
                }
              );
              await loadInvoice();
              Alert.alert('Success', 'Invoice finalized and transaction created!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to finalize invoice');
            } finally {
              setIsFinalizing(false);
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
        <ThemedText style={styles.loadingText}>Loading invoice...</ThemedText>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={48} color={Colors.error.main} />
        <ThemedText style={styles.loadingText}>Invoice not found</ThemedText>
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
              <ThemedText type="title" style={styles.headerTitle}>Invoice Details</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {invoice.vendor_name || 'Unknown Vendor'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Invoice Image */}
        {invoice.image && (
          <Card variant="elevated" style={styles.imageCard}>
            <Image source={{ uri: invoice.image }} style={styles.invoiceImage} resizeMode="contain" />
          </Card>
        )}

        {/* Invoice Info */}
        <Card variant="elevated" style={styles.infoCard}>
          <ThemedText style={styles.cardTitle}>Invoice Information</ThemedText>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Vendor</ThemedText>
              <ThemedText style={styles.infoValue}>{invoice.vendor_name || 'Unknown'}</ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Date</ThemedText>
              <ThemedText style={styles.infoValue}>
                {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Total Amount</ThemedText>
              <ThemedText style={styles.amountValue}>
                £{parseFloat(invoice.total_amount || '0').toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Tax Amount</ThemedText>
              <ThemedText style={styles.infoValue}>
                £{parseFloat(invoice.tax_amount || '0').toFixed(2)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Status</ThemedText>
              <View style={[
                styles.statusBadge,
                { backgroundColor: invoice.is_extracted ? Colors.success.light : Colors.warning.light }
              ]}>
                <ThemedText style={[
                  styles.statusText,
                  { color: invoice.is_extracted ? Colors.success.dark : Colors.warning.dark }
                ]}>
                  {invoice.is_extracted ? 'Extracted' : 'Pending Extraction'}
                </ThemedText>
              </View>
            </View>
            {invoice.extraction_confidence !== undefined && invoice.extraction_confidence !== null && (
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Confidence</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {(invoice.extraction_confidence * 100).toFixed(0)}%
                </ThemedText>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!invoice.is_extracted && (
              <Button
                title={isExtracting ? 'Extracting...' : 'Extract Data (OCR)'}
                variant="primary"
                onPress={handleExtract}
                disabled={isExtracting}
                style={styles.actionBtn}
              />
            )}
            {invoice.is_extracted && (
              <Button
                title={isFinalizing ? 'Finalizing...' : 'Finalize Invoice'}
                variant="primary"
                onPress={handleFinalize}
                disabled={isFinalizing}
                style={styles.actionBtn}
              />
            )}
          </View>
        </Card>

        {/* Items */}
        {invoice.items && invoice.items.length > 0 && (
          <Card variant="elevated" style={styles.itemsCard}>
            <ThemedText style={styles.cardTitle}>
              Items ({invoice.items.length})
            </ThemedText>

            {invoice.items.map((item: InvoiceItem, index: number) => (
              <View
                key={item.id || index}
                style={[styles.itemRow, index < (invoice.items?.length || 0) - 1 && styles.itemBorder]}
              >
                <View style={styles.itemLeft}>
                  <ThemedText style={styles.itemName}>{item.item_name}</ThemedText>
                  {item.description && (
                    <ThemedText style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </ThemedText>
                  )}
                  <ThemedText style={styles.itemMeta}>
                    Qty: {item.quantity} × £{parseFloat(item.rate || '0').toFixed(2)}
                  </ThemedText>
                  {item.category_name && (
                    <ThemedText style={styles.itemCategory}>{item.category_name}</ThemedText>
                  )}
                  {item.product_code && (
                    <ThemedText style={styles.itemCode}>Code: {item.product_code}</ThemedText>
                  )}
                </View>
                <ThemedText style={styles.itemTotal}>
                  £{parseFloat(item.amount || '0').toFixed(2)}
                </ThemedText>
              </View>
            ))}

            {/* Items Total */}
            <View style={styles.totalRow}>
              <ThemedText style={styles.totalLabel}>Items Total</ThemedText>
              <ThemedText style={styles.totalValue}>
                £{invoice.items.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0).toFixed(2)}
              </ThemedText>
            </View>
          </Card>
        )}

        {/* Timestamps */}
        <Card variant="elevated" style={styles.timestampCard}>
          <View style={styles.timestampRow}>
            <ThemedText style={styles.timestampLabel}>Created</ThemedText>
            <ThemedText style={styles.timestampValue}>
              {invoice.created_at ? new Date(invoice.created_at).toLocaleString() : 'N/A'}
            </ThemedText>
          </View>
          <View style={styles.timestampRow}>
            <ThemedText style={styles.timestampLabel}>Updated</ThemedText>
            <ThemedText style={styles.timestampValue}>
              {invoice.updated_at ? new Date(invoice.updated_at).toLocaleString() : 'N/A'}
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
  invoiceImage: {
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
  actionButtons: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  actionBtn: {
    width: '100%',
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
  itemDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
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
  itemCode: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 2,
    borderTopColor: Colors.gray[200],
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
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
