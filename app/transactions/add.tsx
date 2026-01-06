import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type TransactionType = 'income' | 'expense';

const categories = {
  income: [
    { label: 'Salary', value: 'salary' },
    { label: 'Freelance', value: 'freelance' },
    { label: 'Sales', value: 'sales' },
    { label: 'Investment', value: 'investment' },
    { label: 'Other Income', value: 'other-income' },
  ],
  expense: [
    { label: 'Groceries', value: 'groceries' },
    { label: 'Transport', value: 'transport' },
    { label: 'Utilities', value: 'utilities' },
    { label: 'Rent', value: 'rent' },
    { label: 'Raw Materials', value: 'raw-materials' },
    { label: 'Equipment', value: 'equipment' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Other Expense', value: 'other-expense' },
  ],
};

export default function AddTransactionScreen() {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [merchantName, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    // In real app, this would save to backend/state
    console.log({ type, amount, description, category, merchantName, date });
    router.back();
  };

  const categoryList = categories[type];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <ThemedText type="title" style={styles.headerTitle}>Add Transaction</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Type Toggle */}
      <Card variant="elevated" style={styles.typeToggleCard}>
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
            onPress={() => {
              setType('income');
              setCategory('');
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="trending-up" 
              size={20} 
              color={type === 'income' ? Colors.success.main : Colors.text.secondary} 
            />
            <Text style={[
              styles.typeButtonText,
              type === 'income' && styles.typeButtonTextActive
            ]}>
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
            onPress={() => {
              setType('expense');
              setCategory('');
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="trending-down" 
              size={20} 
              color={type === 'expense' ? Colors.error.main : Colors.text.secondary} 
            />
            <Text style={[
              styles.typeButtonText,
              type === 'expense' && styles.typeButtonTextActive
            ]}>
              Expense
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Form */}
      <View style={styles.form}>
        {/* Amount Input */}
        <Card variant="elevated" style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>£</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </Card>

        {/* Description */}
        <Input
          label="Description"
          placeholder="What is this transaction for?"
          value={description}
          onChangeText={setDescription}
          leftIcon={<MaterialIcons name="description" size={20} color={Colors.text.secondary} />}
        />

        {/* Category */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {categoryList.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryChip,
                  category === cat.value && styles.categoryChipActive
                ]}
                onPress={() => setCategory(cat.value)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryChipText,
                  category === cat.value && styles.categoryChipTextActive
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Merchant */}
        <Input
          label="Merchant (Optional)"
          placeholder="e.g., Tesco, Uber, Amazon"
          value={merchantName}
          onChangeText={setMerchant}
          leftIcon={<MaterialIcons name="store" size={20} color={Colors.text.secondary} />}
        />

        {/* Date */}
        <Input
          label="Date"
          placeholder="Select date"
          value={date}
          onChangeText={setDate}
          leftIcon={<MaterialIcons name="calendar-today" size={20} color={Colors.text.secondary} />}
        />

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
    alignItems: 'center',
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
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  typeToggleCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.sm,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
  },
  typeButtonActive: {
    backgroundColor: Colors.background.light,
    ...Shadows.sm,
  },
  typeButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  typeButtonTextActive: {
    color: Colors.text.primary,
  },
  form: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  amountCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primary[50],
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  amountLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  categorySection: {
    marginBottom: Spacing.md,
  },
  categoryLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  categoryChipActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  categoryChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  categoryChipTextActive: {
    color: Colors.text.inverse,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
