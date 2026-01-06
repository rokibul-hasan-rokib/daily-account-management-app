import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type TransactionType = 'income' | 'expense';

const categories = {
  income: [
    { label: 'Salary', value: 'salary', icon: 'account-balance-wallet' },
    { label: 'Freelance', value: 'freelance', icon: 'work' },
    { label: 'Sales', value: 'sales', icon: 'trending-up' },
    { label: 'Investment', value: 'investment', icon: 'show-chart' },
    { label: 'Other Income', value: 'other-income', icon: 'more-horiz' },
  ],
  expense: [
    { label: 'Groceries', value: 'groceries', icon: 'shopping-cart' },
    { label: 'Transport', value: 'transport', icon: 'directions-car' },
    { label: 'Utilities', value: 'utilities', icon: 'bolt' },
    { label: 'Rent', value: 'rent', icon: 'home' },
    { label: 'Raw Materials', value: 'raw-materials', icon: 'inventory' },
    { label: 'Equipment', value: 'equipment', icon: 'build' },
    { label: 'Marketing', value: 'marketing', icon: 'campaign' },
    { label: 'Other Expense', value: 'other-expense', icon: 'more-horiz' },
  ],
};

export default function AddTransactionScreen() {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [merchantName, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB'));

  const handleSave = () => {
    if (!amount || !description || !category) {
      alert('Please fill in all required fields');
      return;
    }
    // In real app, this would save to backend/state
    console.log({ type, amount, description, category, merchantName, date });
    router.back();
  };

  const categoryList = categories[type];
  const isValid = amount && description && category;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <ThemedText type="title" style={styles.headerTitle}>New Transaction</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {type === 'income' ? 'Add income' : 'Add expense'}
            </ThemedText>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Type Toggle - More Prominent */}
        <View style={styles.typeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              styles.typeButtonLeft,
              type === 'income' && styles.typeButtonActive,
              type === 'income' && styles.typeButtonActiveIncome
            ]}
            onPress={() => {
              setType('income');
              setCategory('');
            }}
            activeOpacity={0.8}
          >
            <View style={[
              styles.typeIconContainer,
              type === 'income' && styles.typeIconContainerActive
            ]}>
              <MaterialIcons 
                name="trending-up" 
                size={24} 
                color={type === 'income' ? Colors.primary[600] : Colors.primary[400]} 
              />
            </View>
            <Text style={[
              styles.typeButtonText,
              type === 'income' && styles.typeButtonTextActive
            ]}>
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              styles.typeButtonRight,
              type === 'expense' && styles.typeButtonActive,
              type === 'expense' && styles.typeButtonActiveExpense
            ]}
            onPress={() => {
              setType('expense');
              setCategory('');
            }}
            activeOpacity={0.8}
          >
            <View style={[
              styles.typeIconContainer,
              type === 'expense' && styles.typeIconContainerActive
            ]}>
              <MaterialIcons 
                name="trending-down" 
                size={24} 
                color={type === 'expense' ? Colors.primary[600] : Colors.primary[400]} 
              />
            </View>
            <Text style={[
              styles.typeButtonText,
              type === 'expense' && styles.typeButtonTextActive
            ]}>
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Amount Input - Enhanced */}
          <Card variant="elevated" style={[
            styles.amountCard,
            type === 'income' && styles.amountCardIncome,
            type === 'expense' && styles.amountCardExpense
          ]}>
            <View style={styles.amountHeader}>
              <Text style={styles.amountLabel}>Amount</Text>
              <View style={[
                styles.amountTypeBadge,
                type === 'income' && styles.amountTypeBadgeIncome,
                type === 'expense' && styles.amountTypeBadgeExpense
              ]}>
                <Text style={styles.amountTypeText}>
                  {type === 'income' ? 'INCOME' : 'EXPENSE'}
                </Text>
              </View>
            </View>
            <View style={styles.amountInputContainer}>
              <Text style={[
                styles.currencySymbol,
                type === 'income' && styles.currencySymbolIncome,
                type === 'expense' && styles.currencySymbolExpense
              ]}>£</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus={false}
              />
            </View>
          </Card>

          {/* Description */}
          <Input
            label="Description *"
            placeholder="What is this transaction for?"
            value={description}
            onChangeText={setDescription}
            leftIcon={<MaterialIcons name="description" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          {/* Category - Enhanced */}
          <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryLabel}>Category *</Text>
              {category && (
                <TouchableOpacity onPress={() => setCategory('')}>
                  <Text style={styles.clearCategory}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.categoryGrid}>
              {categoryList.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    category === cat.value && styles.categoryChipActive,
                    category === cat.value && type === 'income' && styles.categoryChipActiveIncome,
                    category === cat.value && type === 'expense' && styles.categoryChipActiveExpense
                  ]}
                  onPress={() => setCategory(cat.value)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons 
                    name={cat.icon as any} 
                    size={18} 
                    color={category === cat.value ? Colors.text.inverse : Colors.text.secondary} 
                  />
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
            label="Merchant"
            placeholder="e.g., Tesco, Uber, Amazon"
            value={merchantName}
            onChangeText={setMerchant}
            leftIcon={<MaterialIcons name="store" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          {/* Date */}
          <TouchableOpacity 
            style={styles.dateContainer}
            activeOpacity={0.7}
            onPress={() => {
              // In real app, open date picker
              alert('Date picker coming soon!');
            }}
          >
            <View style={styles.dateInput}>
              <MaterialIcons name="calendar-today" size={20} color={Colors.primary[500]} />
              <View style={styles.dateContent}>
                <Text style={styles.dateLabel}>Date</Text>
                <Text style={styles.dateValue}>{date}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.primary[400]} />
            </View>
          </TouchableOpacity>

          {/* Action Buttons - Enhanced */}
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
              disabled={!isValid}
              style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
            />
          </View>

          {/* Helper Text */}
          <Text style={styles.helperText}>
            * Required fields
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.primary[100],
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  typeToggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
    borderWidth: 2,
    borderColor: Colors.primary[200],
    ...Shadows.sm,
  },
  typeButtonLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  typeButtonRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  typeButtonActive: {
    borderWidth: 2,
    ...Shadows.md,
  },
  typeButtonActiveIncome: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[100],
  },
  typeButtonActiveExpense: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[100],
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  typeIconContainerActive: {
    backgroundColor: Colors.primary[300],
  },
  typeButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
  typeButtonTextActive: {
    color: Colors.primary[700],
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
  amountCardIncome: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[100],
  },
  amountCardExpense: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[100],
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  amountLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountTypeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[200],
  },
  amountTypeBadgeIncome: {
    backgroundColor: Colors.primary[500],
  },
  amountTypeBadgeExpense: {
    backgroundColor: Colors.primary[500],
  },
  amountTypeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary[600],
    marginRight: Spacing.sm,
  },
  currencySymbolIncome: {
    color: Colors.primary[700],
  },
  currencySymbolExpense: {
    color: Colors.primary[700],
  },
  amountInput: {
    flex: 1,
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary[700],
    paddingVertical: 0,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  categorySection: {
    marginBottom: Spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
  },
  clearCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.semibold,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
  },
  categoryChipActive: {
    borderWidth: 2,
    ...Shadows.sm,
  },
  categoryChipActiveIncome: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[600],
  },
  categoryChipActiveExpense: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[600],
  },
  categoryChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
  categoryChipTextActive: {
    color: Colors.text.inverse,
  },
  dateContainer: {
    marginBottom: Spacing.lg,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary[200],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
  },
  dateValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary[700],
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary[500],
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
