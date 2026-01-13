import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useReceipts } from '@/contexts/receipts-context';
import { useTransactions } from '@/contexts/transactions-context';
import { ReceiptsService, ReceiptItemsService } from '@/services/api';
import { ReceiptItem } from '@/services/api/types';

interface ExtractedItem {
  id?: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: number;
  product_code?: string;
}

export default function ScanReceiptReviewScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const receiptId = params.receiptId ? parseInt(params.receiptId as string) : null;
  
  const { updateReceipt, getReceiptById } = useReceipts();
  const { createTransaction } = useTransactions();
  
  const [isLoading, setIsLoading] = useState(!!receiptId);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] = useState({
    vendor_name: '',
    receipt_date: new Date().toISOString().split('T')[0],
    total_amount: '0.00',
    tax_amount: '0.00',
    items: [] as ExtractedItem[],
  });

  // Load receipt data if receiptId is provided
  useEffect(() => {
    if (receiptId) {
      loadReceipt();
    }
  }, [receiptId]);

  const loadReceipt = async () => {
    try {
      setIsLoading(true);
      const receipt = await ReceiptsService.getReceiptById(receiptId!);
      
      setExtractedData({
        vendor_name: receipt.vendor_name || '',
        receipt_date: receipt.receipt_date || new Date().toISOString().split('T')[0],
        total_amount: receipt.total_amount || '0.00',
        tax_amount: receipt.tax_amount || '0.00',
        items: receipt.items.map(item => ({
          id: item.id,
          item_name: item.item_name,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price),
          category: item.category,
          product_code: item.product_code,
        })),
      });
    } catch (error: any) {
      console.error('Error loading receipt:', error);
      Alert.alert('Error', 'Failed to load receipt data.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = (index: number, field: keyof ExtractedItem, value: string | number) => {
    setExtractedData(prev => ({
      ...prev,
      items: prev.items.map((item, idx) => {
        if (idx !== index) return item;
        
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total_price if quantity or unit_price changes
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
        }
        
        return updatedItem;
      }),
    }));
  };

  const addItem = () => {
    const newItem: ExtractedItem = {
      item_name: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setExtractedData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const deleteItem = (index: number) => {
    setExtractedData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const calculateTotal = () => {
    return extractedData.items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSave = async () => {
    if (!receiptId) {
      Alert.alert('Error', 'Receipt ID is missing.');
      return;
    }

    setIsSaving(true);
    try {
      // Update receipt
      await updateReceipt(receiptId, {
        vendor_name: extractedData.vendor_name,
        receipt_date: extractedData.receipt_date,
        total_amount: extractedData.total_amount,
        tax_amount: extractedData.tax_amount,
      });

      // Update or create receipt items
      for (const item of extractedData.items) {
        if (item.id) {
          // Update existing item
          await ReceiptItemsService.updateReceiptItem(item.id, {
            item_name: item.item_name,
            quantity: item.quantity.toString(),
            unit_price: item.unit_price.toString(),
            total_price: item.total_price.toString(),
            category: item.category,
            product_code: item.product_code,
          });
        } else {
          // Create new item
          await ReceiptItemsService.createReceiptItem({
            receipt: receiptId,
            item_name: item.item_name,
            quantity: item.quantity.toString(),
            unit_price: item.unit_price.toString(),
            total_price: item.total_price.toString(),
            category: item.category,
            product_code: item.product_code,
          });
        }
      }

      // Create transaction from receipt
      // Note: You may want to get the merchant ID from the merchant name
      // For now, we'll create without merchant
      await createTransaction({
        type: 'expense',
        amount: extractedData.total_amount,
        date: extractedData.receipt_date,
        category: 1, // Default category - you may want to make this dynamic
        description: `Receipt from ${extractedData.vendor_name}`,
      });

      Alert.alert('Success', 'Receipt and transaction saved successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error saving receipt:', error);
      Alert.alert('Error', error.message || 'Failed to save receipt. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Review Receipt</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Edit extracted information before saving
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <ThemedText style={styles.loadingText}>Loading receipt data...</ThemedText>
        </View>
      ) : (
        <>
          {/* Receipt Image */}
          {imageUri && (
            <Card variant="elevated" style={styles.imageCard}>
              <Image source={{ uri: imageUri }} style={styles.image} />
            </Card>
          )}

          {/* Merchant & Date */}
          <Card variant="elevated" style={styles.infoCard}>
            <Input
              label="Vendor"
              value={extractedData.vendor_name}
              onChangeText={(value) => setExtractedData(prev => ({ ...prev, vendor_name: value }))}
              leftIcon={<MaterialIcons name="store" size={20} color={Colors.primary[500]} />}
            />
            <Input
              label="Date"
              value={extractedData.receipt_date}
              onChangeText={(value) => setExtractedData(prev => ({ ...prev, receipt_date: value }))}
              leftIcon={<MaterialIcons name="calendar-today" size={20} color={Colors.primary[500]} />}
            />
            <Input
              label="Total Amount"
              value={extractedData.total_amount}
              onChangeText={(value) => setExtractedData(prev => ({ ...prev, total_amount: value }))}
              leftIcon={<MaterialIcons name="attach-money" size={20} color={Colors.primary[500]} />}
              keyboardType="decimal-pad"
            />
            <Input
              label="Tax Amount"
              value={extractedData.tax_amount}
              onChangeText={(value) => setExtractedData(prev => ({ ...prev, tax_amount: value }))}
              leftIcon={<MaterialIcons name="receipt" size={20} color={Colors.primary[500]} />}
              keyboardType="decimal-pad"
            />
          </Card>

      {/* Items List */}
      <Card variant="elevated" style={styles.itemsCard}>
        <View style={styles.itemsHeader}>
          <View style={styles.itemsTitleContainer}>
            <MaterialIcons name="list" size={20} color={Colors.primary[600]} />
            <ThemedText type="subtitle" style={styles.itemsTitle}>
              Line Items ({extractedData.items.length})
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
            <MaterialIcons name="add" size={20} color={Colors.primary[600]} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemsList}>
          {extractedData.items.map((item, index) => (
            <Card key={item.id || `item-${index}`} variant="outlined" style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemNumber}>
                  <Text style={styles.itemNumberText}>#{index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteItem(index)}
                >
                  <MaterialIcons name="delete-outline" size={20} color={Colors.error.main} />
                </TouchableOpacity>
              </View>

              <Input
                label="Item Name"
                value={item.item_name}
                onChangeText={(value) => updateItem(index, 'item_name', value)}
                placeholder="e.g., Beef, Milk"
              />

              <View style={styles.itemRow}>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Quantity</Text>
                  <TextInput
                    style={styles.itemFieldInput}
                    value={item.quantity.toString()}
                    onChangeText={(value) => updateItem(index, 'quantity', parseFloat(value) || 0)}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Unit Price</Text>
                  <TextInput
                    style={styles.itemFieldInput}
                    value={item.unit_price.toFixed(2)}
                    onChangeText={(value) => updateItem(index, 'unit_price', parseFloat(value) || 0)}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Total</Text>
                  <Text style={styles.itemTotal}>
                    £{item.total_price.toFixed(2)}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Calculated Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Calculated Total</Text>
          <Text style={styles.totalValue}>£{calculateTotal().toFixed(2)}</Text>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={() => router.back()}
          style={styles.cancelButton}
          disabled={isSaving}
        />
        <Button
          title={isSaving ? 'Saving...' : 'Save Transaction'}
          variant="primary"
          onPress={handleSave}
          style={styles.saveButton}
          disabled={isSaving}
        />
      </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
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
  imageCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: Colors.gray[100],
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  itemsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  itemsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  addItemButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsList: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  itemCard: {
    padding: Spacing.md,
    backgroundColor: Colors.gray[50],
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  itemNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  itemField: {
    flex: 1,
  },
  itemFieldLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  itemFieldInput: {
    backgroundColor: Colors.background.light,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary[200],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  itemTotal: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[700],
    marginTop: Spacing.sm + 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
  },
  totalValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[700],
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  loadingContainer: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
});
