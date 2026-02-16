import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing } from '@/constants/design-system';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useBudgets } from '@/contexts/budgets-context';
import { useCategories } from '@/contexts/categories-context';
import { BudgetsService } from '@/services/api';

type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function AddBudgetScreen() {
  const params = useLocalSearchParams();
  const isEditMode = !!params.id;
  const { createBudget, updateBudget } = useBudgets();
  const { expenseCategories } = useCategories();

  const [category, setCategory] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);

  useFocusEffect(
    useCallback(() => {
      if (isEditMode && params.id) {
        loadBudgetData();
      }
    }, [isEditMode, params.id])
  );

  const loadBudgetData = async () => {
    try {
      setIsLoadingData(true);
      const budgetId = parseInt(params.id as string);
      const budget = await BudgetsService.getBudgetById(budgetId);

      setCategory(budget.category);
      setAmount(budget.amount);
      setPeriod(budget.period);
      setStartDate(budget.start_date);
      setEndDate(budget.end_date || '');
      setAlertThreshold(budget.alert_threshold?.toString() || '80');
    } catch (error: any) {
      console.error('Error loading budget:', error);
      Alert.alert('Error', 'Failed to load budget data.');
      router.back();
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!category) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount');
      return;
    }

    if (!startDate) {
      Alert.alert('Validation Error', 'Please enter a start date');
      return;
    }

    try {
      setLoading(true);
      const budgetData = {
        category,
        amount: parseFloat(amount).toFixed(2),
        period,
        start_date: startDate,
        end_date: endDate || undefined,
        alert_threshold: alertThreshold ? parseInt(alertThreshold) : undefined,
      };

      if (isEditMode && params.id) {
        await updateBudget(parseInt(params.id.toString()), budgetData);
        Alert.alert('Success', 'Budget updated successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await createBudget(budgetData);
        Alert.alert('Success', 'Budget created successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', error.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <ThemedText style={styles.loadingText}>Loading budget data...</ThemedText>
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
                {isEditMode ? 'Edit Budget' : 'Add Budget'}
              </ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {isEditMode ? 'Update budget details' : 'Set spending limits per category'}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <Card variant="elevated" style={styles.formCard}>
          {/* Category Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Category *</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
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

          <Input
            label="Budget Amount *"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            leftIcon={<MaterialIcons name="attach-money" size={20} color={Colors.primary[500]} />}
          />

          {/* Period Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Period *</ThemedText>
            <View style={styles.periodContainer}>
              {(['daily', 'weekly', 'monthly', 'yearly'] as BudgetPeriod[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.periodButton,
                    period === p && styles.periodButtonActive,
                  ]}
                  onPress={() => setPeriod(p)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[
                    styles.periodButtonText,
                    period === p && styles.periodButtonTextActive,
                  ]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Start Date *"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            leftIcon={<MaterialIcons name="calendar-today" size={20} color={Colors.primary[500]} />}
          />

          <Input
            label="End Date (Optional)"
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
            leftIcon={<MaterialIcons name="event" size={20} color={Colors.primary[500]} />}
          />

          <Input
            label="Alert Threshold (%)"
            value={alertThreshold}
            onChangeText={setAlertThreshold}
            placeholder="80"
            keyboardType="number-pad"
            leftIcon={<MaterialIcons name="notifications" size={20} color={Colors.warning.main} />}
          />
          <ThemedText style={styles.helperText}>
            You'll be alerted when spending reaches this percentage of your budget
          </ThemedText>
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
            title={loading ? 'Saving...' : isEditMode ? 'Update Budget' : 'Create Budget'}
            variant="primary"
            onPress={handleSave}
            style={styles.saveButton}
            disabled={loading || !category || !amount.trim()}
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
  periodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  periodButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  periodButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  periodButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  periodButtonTextActive: {
    color: Colors.text.inverse,
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
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
