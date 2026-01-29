import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useTransactions } from '@/contexts/transactions-context';
import { useCategories } from '@/contexts/categories-context';
import { useMerchants } from '@/contexts/merchants-context';

type TransactionType = 'income' | 'expense';

// Helper to format date to YYYY-MM-DD
const formatDateForAPI = (dateString: string): string => {
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  // Convert DD/MM/YYYY to YYYY-MM-DD
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  // Default to today
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function AddTransactionScreen() {
  const params = useLocalSearchParams();
  const isEditMode = !!params.id;
  const { createTransaction, updateTransaction } = useTransactions();
  const { categories, refreshCategories } = useCategories();
  const { merchants, refreshMerchants } = useMerchants();
  
  const [type, setType] = useState<TransactionType>((params.type as TransactionType) || 'expense');
  const [amount, setAmount] = useState(params.amount?.toString() || '');
  const [description, setDescription] = useState(params.description?.toString() || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(
    params.category ? parseInt(params.category.toString()) : undefined
  );
  const [merchantId, setMerchantId] = useState<number | undefined>(
    params.merchant ? parseInt(params.merchant.toString()) : undefined
  );
  const [notes, setNotes] = useState(params.notes?.toString() || '');
  const [date, setDate] = useState(
    params.date ? formatDateForAPI(params.date.toString()) : new Date().toISOString().split('T')[0]
  );
  const [isRecurring, setIsRecurring] = useState(params.is_recurring === 'true');
  const [recurringFrequency, setRecurringFrequency] = useState(params.recurring_frequency?.toString() || '');
  const [loading, setLoading] = useState(false);

  // Filter categories by type
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.type === type);
  }, [categories, type]);

  useFocusEffect(
    useCallback(() => {
      refreshCategories();
      refreshMerchants();
    }, [refreshCategories, refreshMerchants])
  );

  useEffect(() => {
    if (!isEditMode && !categoryId && filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, categoryId, isEditMode]);

  // Format date for display (YYYY-MM-DD to DD/MM/YYYY)
  const displayDate = useMemo(() => {
    const parts = date.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return date;
  }, [date]);

  const handleSave = async () => {
    if (!amount || !description || !categoryId) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const transactionData = {
        type,
        amount: parseFloat(amount).toFixed(2),
        date: formatDateForAPI(date),
        category: categoryId,
        merchant: merchantId,
        description: description.trim(),
        notes: notes.trim() || undefined,
        is_recurring: isRecurring,
        recurring_frequency: recurringFrequency || undefined,
      };

      if (isEditMode && params.id) {
        await updateTransaction(parseInt(params.id.toString()), transactionData);
        router.replace('/transactions');
      } else {
        await createTransaction(transactionData);
        router.replace('/transactions');
      }
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const isValid = amount && description && categoryId;

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
            <ThemedText type="title" style={styles.headerTitle}>
              {isEditMode ? 'Edit Transaction' : 'New Transaction'}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {isEditMode 
                ? 'Update transaction details' 
                : type === 'income' ? 'Add income' : 'Add expense'}
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
              setCategoryId(undefined);
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
              setCategoryId(undefined);
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
              {categoryId && (
                <TouchableOpacity onPress={() => setCategoryId(undefined)}>
                  <Text style={styles.clearCategory}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            {filteredCategories.length === 0 ? (
              <Text style={styles.noCategoriesText}>
                No {type} categories available. Please create one first.
              </Text>
            ) : (
              <View style={styles.categoryGrid}>
                {filteredCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      categoryId === cat.id && styles.categoryChipActive,
                      categoryId === cat.id && type === 'income' && styles.categoryChipActiveIncome,
                      categoryId === cat.id && type === 'expense' && styles.categoryChipActiveExpense
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                    activeOpacity={0.7}
                  >
                    {cat.icon ? (
                      <Text style={styles.categoryIconEmoji}>{cat.icon}</Text>
                    ) : (
                      <MaterialIcons 
                        name="category" 
                        size={18} 
                        color={categoryId === cat.id ? Colors.text.inverse : Colors.text.secondary} 
                      />
                    )}
                    <Text style={[
                      styles.categoryChipText,
                      categoryId === cat.id && styles.categoryChipTextActive
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Merchant Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Merchant (Optional)</Text>
            <View style={styles.merchantGrid}>
              <TouchableOpacity
                style={[
                  styles.merchantChip,
                  !merchantId && styles.merchantChipActive
                ]}
                onPress={() => setMerchantId(undefined)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.merchantChipText,
                  !merchantId && styles.merchantChipTextActive
                ]}>
                  None
                </Text>
              </TouchableOpacity>
              {merchants.map((merchant) => (
                <TouchableOpacity
                  key={merchant.id}
                  style={[
                    styles.merchantChip,
                    merchantId === merchant.id && styles.merchantChipActive
                  ]}
                  onPress={() => setMerchantId(merchant.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.merchantChipText,
                    merchantId === merchant.id && styles.merchantChipTextActive
                  ]}>
                    {merchant.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <Input
            label="Notes (Optional)"
            placeholder="Additional notes about this transaction"
            value={notes}
            onChangeText={setNotes}
            leftIcon={<MaterialIcons name="notes" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
            multiline
            numberOfLines={3}
          />

          {/* Date */}
          <Input
            label="Date *"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={(text) => {
              // Allow YYYY-MM-DD format
              const cleaned = text.replace(/[^0-9-]/g, '');
              if (cleaned.length <= 10) {
                setDate(cleaned);
              }
            }}
            leftIcon={<MaterialIcons name="calendar-today" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
            keyboardType="numeric"
          />
          <Text style={styles.dateHint}>Format: YYYY-MM-DD (e.g., 2024-01-15)</Text>

          {/* Action Buttons - Enhanced */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelButton}
              disabled={loading}
            />
            <Button
              title={loading ? 'Saving...' : isEditMode ? 'Update Transaction' : 'Save Transaction'}
              variant="primary"
              onPress={handleSave}
              disabled={!isValid || loading}
              style={[styles.saveButton, (!isValid || loading) && styles.saveButtonDisabled]}
            />
          </View>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary[500]} />
            </View>
          )}

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
  categoryIconEmoji: {
    fontSize: 18,
  },
  noCategoriesText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    padding: Spacing.md,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
    marginBottom: Spacing.sm,
  },
  merchantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  merchantChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
  },
  merchantChipActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[600],
  },
  merchantChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
  merchantChipTextActive: {
    color: Colors.text.inverse,
  },
  dateHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: -Spacing.md,
    marginBottom: Spacing.md,
    marginLeft: Spacing.md,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
