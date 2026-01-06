import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Merchant {
  id: string;
  name: string;
  category: string;
  transactionCount: number;
  totalSpent: number;
  lastTransaction: string;
}

const dummyMerchants: Merchant[] = [
  { id: '1', name: 'Tesco', category: 'Groceries', transactionCount: 25, totalSpent: 1250.50, lastTransaction: '2 days ago' },
  { id: '2', name: 'Amazon', category: 'Shopping', transactionCount: 18, totalSpent: 890.25, lastTransaction: '5 days ago' },
  { id: '3', name: 'Uber', category: 'Transport', transactionCount: 32, totalSpent: 450.00, lastTransaction: '1 day ago' },
  { id: '4', name: 'Starbucks', category: 'Food & Drink', transactionCount: 15, totalSpent: 125.75, lastTransaction: '3 days ago' },
];

export default function MerchantsScreen() {
  const [merchants] = useState<Merchant[]>(dummyMerchants);
  const [isAdding, setIsAdding] = useState(false);
  const [newMerchantName, setNewMerchantName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMerchants = merchants.filter(merchant =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMerchant = () => {
    if (newMerchantName.trim()) {
      console.log('Adding merchant:', newMerchantName);
      setNewMerchantName('');
      setIsAdding(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Merchants</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Track spending by merchant
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAdding(!isAdding)}
        >
          <MaterialIcons name={isAdding ? "close" : "add"} size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search merchants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<MaterialIcons name="search" size={20} color={Colors.text.secondary} />}
        />
      </View>

      {/* Add Merchant Form */}
      {isAdding && (
        <Card variant="elevated" style={styles.addFormCard}>
          <ThemedText type="subtitle" style={styles.formTitle}>Add New Merchant</ThemedText>
          <Input
            label="Merchant Name"
            placeholder="e.g., Tesco, Amazon"
            value={newMerchantName}
            onChangeText={setNewMerchantName}
          />
          <Button
            title="Add Merchant"
            variant="primary"
            onPress={handleAddMerchant}
            style={styles.addFormButton}
          />
        </Card>
      )}

      {/* Merchants List */}
      <View style={styles.merchantsList}>
        {filteredMerchants.map((merchant) => (
          <Card key={merchant.id} variant="elevated" style={styles.merchantCard}>
            <View style={styles.merchantContent}>
              <View style={styles.merchantIcon}>
                <MaterialIcons name="store" size={24} color={Colors.primary[600]} />
              </View>
              <View style={styles.merchantInfo}>
                <ThemedText style={styles.merchantName}>{merchant.name}</ThemedText>
                <View style={styles.merchantMeta}>
                  <Text style={styles.merchantCategory}>{merchant.category}</Text>
                  <Text style={styles.metaSeparator}>•</Text>
                  <Text style={styles.merchantCount}>
                    {merchant.transactionCount} transaction{merchant.transactionCount !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={styles.lastTransaction}>
                  Last: {merchant.lastTransaction}
                </Text>
              </View>
              <View style={styles.merchantAmount}>
                <ThemedText style={styles.amountValue}>£{merchant.totalSpent.toFixed(2)}</ThemedText>
                <Text style={styles.amountLabel}>Total</Text>
              </View>
            </View>
          </Card>
        ))}
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  addFormCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  formTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },
  addFormButton: {
    width: '100%',
  },
  merchantsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  merchantCard: {
    padding: Spacing.md,
  },
  merchantContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  merchantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  merchantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  merchantCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  metaSeparator: {
    marginHorizontal: Spacing.xs,
    color: Colors.gray[300],
  },
  merchantCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  lastTransaction: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  merchantAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  amountLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
});
