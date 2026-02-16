import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing } from '@/constants/design-system';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useBudgets } from '@/contexts/budgets-context';
import { useCategories } from '@/contexts/categories-context';
import { Budget } from '@/services/api/types';

type PeriodFilter = 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function BudgetsScreen() {
  const { budgets, isLoading, refreshBudgets, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const [filter, setFilter] = useState<PeriodFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshBudgets();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshBudgets();
    setRefreshing(false);
  }, []);

  const filteredBudgets = useMemo(() => {
    let filtered = [...budgets];
    if (filter !== 'all') {
      filtered = filtered.filter(b => b.period === filter);
    }
    return filtered.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }, [budgets, filter]);

  const getCategoryName = (categoryId: number) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? `${cat.icon || ''} ${cat.name}`.trim() : 'Unknown';
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'daily': return Colors.info.main;
      case 'weekly': return Colors.primary[500];
      case 'monthly': return Colors.success.main;
      case 'yearly': return Colors.warning.main;
      default: return Colors.gray[500];
    }
  };

  const handleDelete = (budget: Budget) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete this budget for ${getCategoryName(budget.category)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budget.id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (budget: Budget) => {
    router.push({ pathname: '/budgets/add', params: { id: budget.id.toString() } } as any);
  };

  const filters: { label: string; value: PeriodFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MenuButton />
            <View style={styles.headerTextContainer}>
              <ThemedText type="title" style={styles.headerTitle}>Budgets</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {filteredBudgets.length} budget{filteredBudgets.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/budgets/add' as any)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContent}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterButton, filter === f.value && styles.filterButtonActive]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.filterButtonText, filter === f.value && styles.filterButtonTextActive]}>
                {f.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Budget List */}
        {isLoading && budgets.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <ThemedText style={styles.loadingText}>Loading budgets...</ThemedText>
          </View>
        ) : filteredBudgets.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <MaterialIcons name="account-balance-wallet" size={48} color={Colors.gray[300]} />
            <ThemedText style={styles.emptyTitle}>No Budgets</ThemedText>
            <ThemedText style={styles.emptyText}>
              Create budgets to track your spending limits per category
            </ThemedText>
            <Button
              title="Create Budget"
              variant="primary"
              onPress={() => router.push('/budgets/add' as any)}
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          filteredBudgets.map((budget) => (
            <Card key={budget.id} variant="elevated" style={styles.budgetCard}>
              <TouchableOpacity
                style={styles.budgetContent}
                onPress={() => handleEdit(budget)}
                activeOpacity={0.7}
              >
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetLeft}>
                    <View style={[styles.periodBadge, { backgroundColor: getPeriodColor(budget.period) + '20' }]}>
                      <ThemedText style={[styles.periodBadgeText, { color: getPeriodColor(budget.period) }]}>
                        {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.budgetCategory}>
                      {getCategoryName(budget.category)}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.budgetAmount}>
                    £{parseFloat(budget.amount).toFixed(2)}
                  </ThemedText>
                </View>

                <View style={styles.budgetDetails}>
                  <View style={styles.budgetDetailItem}>
                    <MaterialIcons name="calendar-today" size={14} color={Colors.text.secondary} />
                    <ThemedText style={styles.budgetDetailText}>
                      From {new Date(budget.start_date).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  {budget.end_date && (
                    <View style={styles.budgetDetailItem}>
                      <MaterialIcons name="event" size={14} color={Colors.text.secondary} />
                      <ThemedText style={styles.budgetDetailText}>
                        To {new Date(budget.end_date).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  )}
                  {budget.alert_threshold && (
                    <View style={styles.budgetDetailItem}>
                      <MaterialIcons name="notifications" size={14} color={Colors.warning.main} />
                      <ThemedText style={styles.budgetDetailText}>
                        Alert at {budget.alert_threshold}%
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.budgetActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(budget)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="edit" size={18} color={Colors.primary[500]} />
                    <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(budget)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="delete" size={18} color={Colors.error.main} />
                    <ThemedText style={[styles.actionButtonText, { color: Colors.error.main }]}>Delete</ThemedText>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Card>
          ))
        )}
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
  headerTextContainer: {
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterContent: {
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    marginRight: Spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  filterButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  filterButtonTextActive: {
    color: Colors.text.inverse,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['3xl'],
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    minWidth: 160,
  },
  budgetCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  budgetContent: {
    padding: Spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  budgetLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  periodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  periodBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  budgetCategory: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  budgetAmount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
  budgetDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  budgetDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  budgetDetailText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  budgetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary[500],
  },
});
