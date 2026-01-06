import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, TextInput, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ExtractedItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function ScanReceiptReviewScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;

  // Simulated extracted data - in real app, this comes from OCR/ML API
  const [extractedData, setExtractedData] = useState({
    merchantName: 'Tesco',
    date: new Date().toLocaleDateString('en-GB'),
    totalAmount: '180.00',
    items: [
      { id: '1', itemName: 'Beef', quantity: 5, unitPrice: 24.00, totalPrice: 120.00 },
      { id: '2', itemName: 'Cauliflower', quantity: 4, unitPrice: 10.00, totalPrice: 40.00 },
      { id: '3', itemName: 'Onion', quantity: 10, unitPrice: 2.00, totalPrice: 20.00 },
    ] as ExtractedItem[],
  });

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const updateItem = (id: string, field: keyof ExtractedItem, value: string | number) => {
    setExtractedData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id
          ? { ...item, [field]: value, totalPrice: field === 'quantity' || field === 'unitPrice' 
              ? (typeof value === 'number' ? value : parseFloat(value.toString())) * 
                (field === 'quantity' ? item.unitPrice : item.quantity)
              : item.totalPrice }
          : item
      ),
    }));
  };

  const addItem = () => {
    const newItem: ExtractedItem = {
      id: Date.now().toString(),
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setExtractedData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setEditingItemId(newItem.id);
  };

  const deleteItem = (id: string) => {
    setExtractedData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  const calculateTotal = () => {
    return extractedData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSave = () => {
    // In real app, save transaction + receipt + items
    console.log('Saving:', {
      transaction: {
        type: 'expense',
        amount: parseFloat(extractedData.totalAmount),
        merchantName: extractedData.merchantName,
        date: extractedData.date,
      },
      receipt: {
        merchantName: extractedData.merchantName,
        totalAmount: parseFloat(extractedData.totalAmount),
        items: extractedData.items,
      },
    });
    router.back();
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

      {/* Receipt Image */}
      {imageUri && (
        <Card variant="elevated" style={styles.imageCard}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </Card>
      )}

      {/* Merchant & Date */}
      <Card variant="elevated" style={styles.infoCard}>
        <Input
          label="Merchant"
          value={extractedData.merchantName}
          onChangeText={(value) => setExtractedData(prev => ({ ...prev, merchantName: value }))}
          leftIcon={<MaterialIcons name="store" size={20} color={Colors.primary[500]} />}
        />
        <Input
          label="Date"
          value={extractedData.date}
          onChangeText={(value) => setExtractedData(prev => ({ ...prev, date: value }))}
          leftIcon={<MaterialIcons name="calendar-today" size={20} color={Colors.primary[500]} />}
        />
        <Input
          label="Total Amount"
          value={extractedData.totalAmount}
          onChangeText={(value) => setExtractedData(prev => ({ ...prev, totalAmount: value }))}
          leftIcon={<MaterialIcons name="attach-money" size={20} color={Colors.primary[500]} />}
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
            <Card key={item.id} variant="outlined" style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemNumber}>
                  <Text style={styles.itemNumberText}>#{index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteItem(item.id)}
                >
                  <MaterialIcons name="delete-outline" size={20} color={Colors.error.main} />
                </TouchableOpacity>
              </View>

              <Input
                label="Item Name"
                value={item.itemName}
                onChangeText={(value) => updateItem(item.id, 'itemName', value)}
                placeholder="e.g., Beef, Milk"
              />

              <View style={styles.itemRow}>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Quantity</Text>
                  <TextInput
                    style={styles.itemFieldInput}
                    value={item.quantity.toString()}
                    onChangeText={(value) => updateItem(item.id, 'quantity', parseFloat(value) || 0)}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Unit Price</Text>
                  <TextInput
                    style={styles.itemFieldInput}
                    value={item.unitPrice.toFixed(2)}
                    onChangeText={(value) => updateItem(item.id, 'unitPrice', parseFloat(value) || 0)}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.itemField}>
                  <Text style={styles.itemFieldLabel}>Total</Text>
                  <Text style={styles.itemTotal}>
                    £{item.totalPrice.toFixed(2)}
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
        />
        <Button
          title="Save Transaction"
          variant="primary"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>
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
});
