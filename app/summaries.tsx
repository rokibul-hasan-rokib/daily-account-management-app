import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuButton } from '@/components/menu-button';
import { formatCurrency, getPeriodDates } from '@/utils/helpers';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AnalyticsService } from '@/services/api';
import { SummariesResponse } from '@/services/api/types';
import { useFocusEffect } from 'expo-router';

export default function SummariesScreen() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [summariesData, setSummariesData] = useState<SummariesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { start, end } = getPeriodDates(period);

  const loadSummariesData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        range: period,
      };
      
      const data = await AnalyticsService.getSummaries(params);
      setSummariesData(data);
    } catch (error: any) {
      console.error('Error loading summaries data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadSummariesData();
  }, [loadSummariesData]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSummariesData();
    }, [loadSummariesData])
  );

  const totalIncome = summariesData ? parseFloat(summariesData.income) : 0;
  const totalExpenses = summariesData ? parseFloat(summariesData.expenses) : 0;
  const balance = summariesData ? parseFloat(summariesData.balance) : 0;
  const prevIncome = summariesData ? parseFloat(summariesData.prev_income) : 0;
  const prevExpenses = summariesData ? parseFloat(summariesData.prev_expenses) : 0;
  const prevBalance = summariesData ? parseFloat(summariesData.prev_balance) : 0;
  const insights = summariesData?.insights || [];
  const categoryExpenses = summariesData?.category_expenses || [];
  const upcomingBills = summariesData?.upcoming_bills || [];

  const periodLabel = period === 'day' ? 'Today' : period === 'week' ? 'This Week' : 'This Month';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Summaries</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Quick insights into your finances
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Period Filter */}
      <View style={styles.periodFilter}>
        {(['day', 'week', 'month'] as const).map((p) => (
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
              {p === 'day' ? 'Today' : p === 'week' ? 'Week' : 'Month'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <ThemedText style={styles.loadingText}>Loading summaries...</ThemedText>
        </View>
      ) : (
        <>
          {/* Summary Overview Card */}
          <Card variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="assessment" size={24} color={Colors.primary[600]} />
              <ThemedText type="subtitle" style={styles.summaryTitle}>
                {periodLabel} Summary
              </ThemedText>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <ThemedText style={styles.summaryStatLabel}>Money In</ThemedText>
                <ThemedText style={[styles.summaryStatValue, { color: Colors.success.main }]}>
                  {formatCurrency(totalIncome)}
                </ThemedText>
                {prevIncome > 0 && (
                  <ThemedText style={styles.summaryStatChange}>
                    Prev: {formatCurrency(prevIncome)}
                  </ThemedText>
                )}
              </View>
              <View style={styles.summaryStat}>
                <ThemedText style={styles.summaryStatLabel}>Money Out</ThemedText>
                <ThemedText style={[styles.summaryStatValue, { color: Colors.error.main }]}>
                  {formatCurrency(totalExpenses)}
                </ThemedText>
                {prevExpenses > 0 && (
                  <ThemedText style={styles.summaryStatChange}>
                    Prev: {formatCurrency(prevExpenses)}
                  </ThemedText>
                )}
              </View>
              <View style={styles.summaryStat}>
                <ThemedText style={styles.summaryStatLabel}>Balance</ThemedText>
                <ThemedText style={[
                  styles.summaryStatValue,
                  balance >= 0 ? { color: Colors.success.main } : { color: Colors.error.main }
                ]}>
                  {formatCurrency(balance)}
                </ThemedText>
                {prevBalance !== 0 && (
                  <ThemedText style={styles.summaryStatChange}>
                    Prev: {formatCurrency(prevBalance)}
                  </ThemedText>
                )}
              </View>
            </View>
          </Card>

          {/* Insights */}
          {insights.length > 0 && (
            <Card variant="elevated" style={styles.insightsCard}>
              <View style={styles.insightsHeader}>
                <MaterialIcons name="lightbulb" size={20} color={Colors.warning.main} />
                <ThemedText type="subtitle" style={styles.insightsTitle}>
                  Key Insights
                </ThemedText>
              </View>
              <View style={styles.insightsList}>
                {insights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <View style={styles.insightDot} />
                    <ThemedText style={styles.insightText}>{insight}</ThemedText>
                  </View>
                ))}
              </View>
              {insights.length === 0 && (
                <ThemedText style={styles.emptyText}>No insights available for this period.</ThemedText>
              )}
            </Card>
          )}

          {/* Category Breakdown */}
          {categoryExpenses.length > 0 && (
            <Card variant="elevated" style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <MaterialIcons name="pie-chart" size={20} color={Colors.primary[600]} />
                <ThemedText type="subtitle" style={styles.categoryTitle}>
                  Where Your Money Went
                </ThemedText>
              </View>
              <View style={styles.categoryList}>
                {categoryExpenses.map((item, index) => {
                  const amount = parseFloat(item.total);
                  const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(0) : '0';
                  return (
                    <View key={index} style={styles.categoryItem}>
                      <View style={styles.categoryInfo}>
                        <ThemedText style={styles.categoryName}>
                          {item.category__name}
                        </ThemedText>
                      </View>
                      <View style={styles.categoryAmount}>
                        <ThemedText style={styles.categoryAmountValue}>{formatCurrency(amount)}</ThemedText>
                        <Badge label={`${percentage}%`} variant="info" size="sm" />
                      </View>
                    </View>
                  );
                })}
              </View>
              {categoryExpenses.length === 0 && (
                <ThemedText style={styles.emptyText}>No category expenses for this period.</ThemedText>
              )}
            </Card>
          )}

          {/* Upcoming Bills */}
          {upcomingBills.length > 0 && (
            <Card variant="elevated" style={styles.billsCard}>
              <View style={styles.billsHeader}>
                <MaterialIcons name="event" size={20} color={Colors.warning.main} />
                <ThemedText type="subtitle" style={styles.billsTitle}>
                  Upcoming Bills
                </ThemedText>
              </View>
              <View style={styles.billsList}>
                {upcomingBills.slice(0, 5).map((bill) => (
                  <View key={bill.id} style={styles.billItem}>
                    <View style={styles.billInfo}>
                      <ThemedText style={styles.billName}>{bill.name}</ThemedText>
                      <ThemedText style={styles.billDue}>
                        Due {new Date(bill.due_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.billAmount}>{formatCurrency(parseFloat(bill.amount))}</ThemedText>
                  </View>
                ))}
              </View>
              {upcomingBills.length === 0 && (
                <ThemedText style={styles.emptyText}>No upcoming bills.</ThemedText>
              )}
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
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  summaryStat: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
  },
  summaryStatLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryStatValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryStatChange: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  insightsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  insightsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  insightsList: {
    gap: Spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  insightMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.warning.main,
    marginTop: 6,
  },
  insightText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    flex: 1,
  },
  categoryCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  categoryList: {
    gap: Spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  categoryMeta: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  categoryAmount: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  categoryAmountValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  billsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    padding: Spacing.lg,
  },
  billsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  billsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  billsList: {
    gap: Spacing.md,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  billDue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  billAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.error.main,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: Spacing.md,
  },
});
