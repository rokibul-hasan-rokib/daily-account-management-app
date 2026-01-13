import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing } from '@/constants/design-system';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLiabilities } from '@/contexts/liabilities-context';
import { useCategories } from '@/contexts/categories-context';
import { LiabilitiesService } from '@/services/api';

type LiabilityStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function AddBillScreen() {
  const params = useLocalSearchParams();
  const isEditMode = !!params.id;
  const { createLiability, updateLiability, getLiabilityById } = useLiabilities();
  const { expenseCategories } = useCategories();
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<LiabilityStatus>('pending');
  const [category, setCategory] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('monthly');
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);

  // Load bill data if editing
  useFocusEffect(
    useCallback(() => {
      if (isEditMode && params.id) {
        loadBillData();
      }
    }, [isEditMode, params.id])
  );

  const loadBillData = async () => {
    try {
      setIsLoadingData(true);
      const billId = parseInt(params.id as string);
      const bill = await LiabilitiesService.getLiabilityById(billId);
      
      setName(bill.name);
      setAmount(bill.amount);
      setDueDate(bill.due_date);
      setStatus(bill.status);
      setCategory(bill.category);
      setDescription(bill.description || '');
      setIsRecurring(bill.is_recurring || false);
      setRecurringFrequency((bill.recurring_frequency as RecurringFrequency) || 'monthly');
    } catch (error: any) {
      console.error('Error loading bill:', error);
      Alert.alert('Error', 'Failed to load bill data.');
      router.back();
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a bill name');
      return;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount');
      return;
    }

    if (!dueDate) {
      Alert.alert('Validation Error', 'Please select a due date');
      return;
    }

    try {
      setLoading(true);
      const billData = {
        name: name.trim(),
        amount: parseFloat(amount).toFixed(2),
        due_date: dueDate,
        status,
        category: category || undefined,
        description: description.trim() || undefined,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? recurringFrequency : undefined,
      };

      if (isEditMode && params.id) {
        await updateLiability(parseInt(params.id.toString()), billData);
        Alert.alert('Success', 'Bill updated successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await createLiability(billData);
        Alert.alert('Success', 'Bill created successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      console.error('Error saving bill:', error);
      Alert.alert('Error', error.message || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <ThemedText style={styles.loadingText}>Loading bill data...</ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MenuButton />
            <View>
              <ThemedText type="title" style={styles.headerTitle}>
                {isEditMode ? 'Edit Bill' : 'Add Bill'}
              </ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {isEditMode ? 'Update bill information' : 'Create a new bill or liability'}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <Card variant="elevated" style={styles.formCard}>
          <Input
            label="Bill Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Electricity Bill"
            leftIcon={<MaterialIcons name="receipt" size={20} color={Colors.primary[500]} />}
          />

          <Input
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            leftIcon={<MaterialIcons name="attach-money" size={20} color={Colors.primary[500]} />}
          />

          <Input
            label="Due Date"
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            leftIcon={<MaterialIcons name="calendar-today" size={20} color={Colors.primary[500]} />}
          />

          {/* Status Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Status</ThemedText>
            <View style={styles.statusContainer}>
              {(['pending', 'paid', 'overdue', 'cancelled'] as LiabilityStatus[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusButton,
                    status === s && styles.statusButtonActive,
                  ]}
                  onPress={() => setStatus(s)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[
                    styles.statusButtonText,
                    status === s && styles.statusButtonTextActive,
                  ]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          {expenseCategories.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>Category</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    !category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(undefined)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[
                    styles.categoryButtonText,
                    !category && styles.categoryButtonTextActive,
                  ]}>
                    None
                  </ThemedText>
                </TouchableOpacity>
                {expenseCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      category === cat.id && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={[
                      styles.categoryButtonText,
                      category === cat.id && styles.categoryButtonTextActive,
                    ]}>
                      {cat.icon} {cat.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Optional notes about this bill"
            multiline
            numberOfLines={3}
            leftIcon={<MaterialIcons name="notes" size={20} color={Colors.primary[500]} />}
          />

          {/* Recurring Toggle */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.recurringToggle}
              onPress={() => setIsRecurring(!isRecurring)}
              activeOpacity={0.7}
            >
              <View style={styles.recurringToggleLeft}>
                <MaterialIcons 
                  name="repeat" 
                  size={20} 
                  color={isRecurring ? Colors.primary[600] : Colors.text.secondary} 
                />
                <ThemedText style={styles.recurringToggleLabel}>Recurring Bill</ThemedText>
              </View>
              <View style={[
                styles.toggleSwitch,
                isRecurring && styles.toggleSwitchActive,
              ]}>
                <View style={[
                  styles.toggleSwitchThumb,
                  isRecurring && styles.toggleSwitchThumbActive,
                ]} />
              </View>
            </TouchableOpacity>

            {isRecurring && (
              <View style={styles.recurringFrequencyContainer}>
                <ThemedText style={styles.sectionLabel}>Frequency</ThemedText>
                <View style={styles.frequencyContainer}>
                  {(['daily', 'weekly', 'monthly', 'yearly'] as RecurringFrequency[]).map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[
                        styles.frequencyButton,
                        recurringFrequency === f && styles.frequencyButtonActive,
                      ]}
                      onPress={() => setRecurringFrequency(f)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={[
                        styles.frequencyButtonText,
                        recurringFrequency === f && styles.frequencyButtonTextActive,
                      ]}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => router.back()}
            style={styles.cancelButton}
            disabled={loading}
          />
          <Button
            title={loading ? 'Saving...' : isEditMode ? 'Update Bill' : 'Create Bill'}
            variant="primary"
            onPress={handleSave}
            style={styles.saveButton}
            disabled={loading || !name.trim() || !amount.trim()}
          />
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
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[50],
  },
  loadingText: {
    marginTop: Spacing.md,
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
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  formCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statusButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  statusButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  statusButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  statusButtonTextActive: {
    color: Colors.text.inverse,
  },
  categoryScroll: {
    marginTop: Spacing.xs,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginRight: Spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  categoryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  categoryButtonTextActive: {
    color: Colors.text.inverse,
  },
  recurringToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  recurringToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recurringToggleLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray[300],
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: Colors.primary[500],
  },
  toggleSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.text.inverse,
    alignSelf: 'flex-start',
  },
  toggleSwitchThumbActive: {
    alignSelf: 'flex-end',
  },
  recurringFrequencyContainer: {
    marginTop: Spacing.md,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  frequencyButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  frequencyButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  frequencyButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  frequencyButtonTextActive: {
    color: Colors.text.inverse,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
