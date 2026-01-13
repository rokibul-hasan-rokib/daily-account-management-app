import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { MenuButton } from '@/components/menu-button';
import { formatCurrency, getPeriodDates } from '@/utils/helpers';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AnalyticsService } from '@/services/api';
import { ProfitLossResponse } from '@/services/api/types';

// Helper to format date to YYYY-MM-DD
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ProfitLossScreen() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [profitLossData, setProfitLossData] = useState<ProfitLossResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { start, end } = getPeriodDates(period);

  const loadProfitLossData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        range: period,
      };
      
      const data = await AnalyticsService.getProfitLoss(params);
      setProfitLossData(data);
    } catch (error: any) {
      console.error('Error loading profit & loss data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadProfitLossData();
  }, [loadProfitLossData]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfitLossData();
    }, [loadProfitLossData])
  );

  const totalIncome = profitLossData ? parseFloat(profitLossData.total_income) : 0;
  const totalExpenses = profitLossData ? parseFloat(profitLossData.total_expense) : 0;
  const netProfit = profitLossData ? parseFloat(profitLossData.net_profit) : 0;
  const incomeByCategory = profitLossData?.income_by_category || [];
  const expenseByCategory = profitLossData?.expense_by_category || [];
  const monthlyData = profitLossData?.monthly_data || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Profit & Loss</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Income vs expenses analysis
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Explanation Card */}
      <Card variant="outlined" style={styles.explanationCard}>
        <View style={styles.explanationContent}>
          <MaterialIcons name="info" size={20} color={Colors.info.main} />
          <View style={styles.explanationText}>
            <Text style={styles.explanationTitle}>What is Profit & Loss?</Text>
            <Text style={styles.explanationBody}>
              Profit = Income − Expenses{'\n'}
              A positive number means you made money. A negative number means you spent more than you earned.
            </Text>
          </View>
        </View>
      </Card>

      {/* Period Filter */}
      <View style={styles.periodFilter}>
        {(['today', 'week', 'month'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.7}
          >
            <ThemedText style={[
              styles.periodButtonText,
              period === p && styles.periodButtonTextActive
            ]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <ThemedText style={styles.loadingText}>Loading profit & loss data...</ThemedText>
        </View>
      ) : (
        <>
          {/* Summary Card */}
          <Card variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <MaterialIcons name="trending-up" size={20} color={Colors.success.main} />
                <ThemedText style={styles.summaryLabel}>Total Income</ThemedText>
              </View>
              <ThemedText style={[styles.summaryValue, styles.incomeValue]}>
                {formatCurrency(totalIncome)}
              </ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <MaterialIcons name="trending-down" size={20} color={Colors.error.main} />
                <ThemedText style={styles.summaryLabel}>Total Expenses</ThemedText>
              </View>
              <ThemedText style={[styles.summaryValue, styles.expenseValue]}>
                {formatCurrency(totalExpenses)}
              </ThemedText>
            </View>

            <View style={[styles.divider, styles.dividerThick]} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <MaterialIcons 
                  name={netProfit >= 0 ? "check-circle" : "cancel"} 
                  size={24} 
                  color={netProfit >= 0 ? Colors.success.main : Colors.error.main} 
                />
                <ThemedText style={[styles.summaryLabel, styles.profitLabel]}>
                  Net Profit / Loss
                </ThemedText>
              </View>
              <ThemedText style={[
                styles.summaryValue,
                styles.profitValue,
                netProfit >= 0 ? styles.profitPositive : styles.profitNegative
              ]}>
                {formatCurrency(netProfit)}
              </ThemedText>
            </View>
          </Card>

          {/* Income Breakdown */}
          {incomeByCategory.length > 0 && (
            <Card variant="elevated" style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons name="account-balance-wallet" size={20} color={Colors.success.main} />
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Income Breakdown
                </ThemedText>
              </View>
              <View style={styles.categoriesList}>
                {incomeByCategory.map((item, index) => {
                  const amount = parseFloat(item.total);
                  return (
                    <View key={index} style={styles.categoryRow}>
                      <View style={styles.categoryInfo}>
                        <View style={[
                          styles.categoryDot,
                          { backgroundColor: Colors.success.main }
                        ]} />
                        <ThemedText style={styles.categoryName}>
                          {item.category__name}
                        </ThemedText>
                      </View>
                      <View style={styles.categoryAmountContainer}>
                        <ThemedText style={styles.categoryAmount}>
                          {formatCurrency(amount)}
                        </ThemedText>
                        {totalIncome > 0 && (
                          <ThemedText style={styles.categoryPercentage}>
                            {((amount / totalIncome) * 100).toFixed(0)}%
                          </ThemedText>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}

          {/* Expenses Breakdown */}
          {expenseByCategory.length > 0 && (
            <Card variant="elevated" style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons name="shopping-cart" size={20} color={Colors.error.main} />
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Expenses Breakdown
                </ThemedText>
              </View>
              <View style={styles.categoriesList}>
                {expenseByCategory.map((item, index) => {
                  const amount = parseFloat(item.total);
                  return (
                    <View key={index} style={styles.categoryRow}>
                      <View style={styles.categoryInfo}>
                        <View style={[
                          styles.categoryDot,
                          { backgroundColor: Colors.error.main }
                        ]} />
                        <ThemedText style={styles.categoryName}>
                          {item.category__name}
                        </ThemedText>
                      </View>
                      <View style={styles.categoryAmountContainer}>
                        <ThemedText style={styles.categoryAmount}>
                          {formatCurrency(amount)}
                        </ThemedText>
                        {totalExpenses > 0 && (
                          <ThemedText style={styles.categoryPercentage}>
                            {((amount / totalExpenses) * 100).toFixed(0)}%
                          </ThemedText>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}

          {/* Monthly Data */}
          {monthlyData.length > 0 && (
            <Card variant="elevated" style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons name="calendar-today" size={20} color={Colors.primary[600]} />
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Monthly Trend
                </ThemedText>
              </View>
              <View style={styles.monthlyList}>
                {monthlyData.map((month, index) => {
                  const income = typeof month.income === 'string' ? parseFloat(month.income) : month.income;
                  const expense = typeof month.expense === 'string' ? parseFloat(month.expense) : month.expense;
                  const profit = typeof month.profit === 'string' ? parseFloat(month.profit) : month.profit;
                  return (
                    <View key={index} style={styles.monthlyRow}>
                      <ThemedText style={styles.monthLabel}>{month.month}</ThemedText>
                      <View style={styles.monthlyAmounts}>
                        <View style={styles.monthlyItem}>
                          <ThemedText style={styles.monthlyLabel}>Income</ThemedText>
                          <ThemedText style={[styles.monthlyValue, { color: Colors.success.main }]}>
                            {formatCurrency(income)}
                          </ThemedText>
                        </View>
                        <View style={styles.monthlyItem}>
                          <ThemedText style={styles.monthlyLabel}>Expense</ThemedText>
                          <ThemedText style={[styles.monthlyValue, { color: Colors.error.main }]}>
                            {formatCurrency(expense)}
                          </ThemedText>
                        </View>
                        <View style={styles.monthlyItem}>
                          <ThemedText style={styles.monthlyLabel}>Profit</ThemedText>
                          <ThemedText style={[
                            styles.monthlyValue,
                            { color: profit >= 0 ? Colors.success.main : Colors.error.main }
                          ]}>
                            {formatCurrency(profit)}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  explanationCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.info.light,
    borderColor: Colors.info.main,
  },
  explanationContent: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  explanationText: {
    flex: 1,
  },
  explanationTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  explanationBody: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * 1.5,
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
  periodFilter: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  periodButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    ...Shadows.sm,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  periodButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  periodButtonTextActive: {
    color: Colors.text.inverse,
  },
  loadingContainer: {
    padding: Spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
  },
  summaryCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  incomeValue: {
    color: Colors.success.main,
  },
  expenseValue: {
    color: Colors.error.main,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: Spacing.sm,
  },
  dividerThick: {
    height: 2,
    backgroundColor: Colors.gray[300],
    marginVertical: Spacing.md,
  },
  profitLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  profitValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
  },
  profitPositive: {
    color: Colors.success.main,
  },
  profitNegative: {
    color: Colors.error.main,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  categoriesList: {
    gap: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  categoryName: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  monthlyList: {
    gap: Spacing.md,
  },
  monthlyRow: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  monthLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  monthlyAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.sm,
  },
  monthlyItem: {
    flex: 1,
    alignItems: 'center',
  },
  monthlyLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  monthlyValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
