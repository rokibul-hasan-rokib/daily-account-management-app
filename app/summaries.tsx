import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuButton } from '@/components/menu-button';
import {
  dummyTransactions,
  getTotalExpenses,
  getTotalIncome,
  getUpcomingLiabilities,
  dummyReceiptItems,
  dummyReceipts,
} from '@/data/dummy-data';
import { formatCurrency, getPeriodDates } from '@/utils/helpers';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface SummaryInsight {
  type: 'spending' | 'category' | 'bill' | 'comparison' | 'item';
  title: string;
  message: string;
  icon: string;
  color: string;
}

export default function SummariesScreen() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  const { start, end } = getPeriodDates(period);
  const transactions = dummyTransactions.filter(t => t.date >= start && t.date <= end);
  
  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const balance = totalIncome - totalExpenses;
  const profitLoss = totalIncome - totalExpenses;

  // Previous period for comparison
  const prevStart = new Date(start);
  const prevEnd = new Date(start);
  const periodLength = end.getTime() - start.getTime();
  prevStart.setTime(start.getTime() - periodLength);

  const previousTransactions = dummyTransactions.filter(
    t => t.date >= prevStart && t.date < start
  );
  const prevIncome = getTotalIncome(previousTransactions);
  const prevExpenses = getTotalExpenses(previousTransactions);

  // Generate insights
  const insights = useMemo(() => {
    const summaryInsights: SummaryInsight[] = [];

    // 1. Top spending category
    const categorySpending: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      }
    });

    const topCategory = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])[0];

    if (topCategory) {
      const percentage = ((topCategory[1] / totalExpenses) * 100).toFixed(0);
      summaryInsights.push({
        type: 'category',
        title: 'Top Spending Category',
        message: `${topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1).replace('-', ' ')} accounted for ${percentage}% of your expenses (${formatCurrency(topCategory[1])})`,
        icon: 'shopping-cart',
        color: Colors.primary[500],
      });
    }

    // 2. Comparison vs previous period
    if (prevExpenses > 0) {
      const expenseChange = ((totalExpenses - prevExpenses) / prevExpenses) * 100;
      if (Math.abs(expenseChange) > 5) {
        summaryInsights.push({
          type: 'comparison',
          title: expenseChange > 0 ? 'Spending Increased' : 'Spending Decreased',
          message: `Your expenses ${expenseChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(expenseChange).toFixed(0)}% compared to the previous ${period}`,
          icon: expenseChange > 0 ? 'trending-up' : 'trending-down',
          color: expenseChange > 0 ? Colors.error.main : Colors.success.main,
        });
      }
    }

    // 3. Upcoming bills
    const upcomingBills = getUpcomingLiabilities();
    if (upcomingBills.length > 0) {
      const totalBills = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
      summaryInsights.push({
        type: 'bill',
        title: 'Upcoming Bills',
        message: `You have ${upcomingBills.length} bill${upcomingBills.length !== 1 ? 's' : ''} totaling ${formatCurrency(totalBills)} due soon`,
        icon: 'event',
        color: Colors.warning.main,
      });
    }

    // 4. Top item spending (if receipts exist)
    const currentReceipts = dummyReceipts.filter(r => r.date >= start && r.date <= end);
    const currentReceiptIds = currentReceipts.map(r => r.id);
    const currentItems = dummyReceiptItems.filter(item => currentReceiptIds.includes(item.receiptId));

    if (currentItems.length > 0) {
      const itemSpending: Record<string, number> = {};
      currentItems.forEach(item => {
        itemSpending[item.itemName] = (itemSpending[item.itemName] || 0) + item.totalPrice;
      });

      const topItem = Object.entries(itemSpending)
        .sort((a, b) => b[1] - a[1])[0];

      if (topItem) {
        summaryInsights.push({
          type: 'item',
          title: 'Top Item Purchase',
          message: `You spent ${formatCurrency(topItem[1])} on ${topItem[0]} this ${period}`,
          icon: 'inventory',
          color: Colors.info.main,
        });
      }
    }

    // 5. Profit/Loss status
    if (profitLoss > 0) {
      summaryInsights.push({
        type: 'comparison',
        title: 'Positive Profit',
        message: `You're in profit! Income exceeded expenses by ${formatCurrency(profitLoss)}`,
        icon: 'check-circle',
        color: Colors.success.main,
      });
    } else if (profitLoss < 0) {
      summaryInsights.push({
        type: 'comparison',
        title: 'Loss This Period',
        message: `Expenses exceeded income by ${formatCurrency(Math.abs(profitLoss))}`,
        icon: 'warning',
        color: Colors.error.main,
      });
    }

    return summaryInsights;
  }, [period, transactions, totalExpenses, prevExpenses, profitLoss]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { amount: number; count: number }> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        if (!breakdown[t.category]) {
          breakdown[t.category] = { amount: 0, count: 0 };
        }
        breakdown[t.category].amount += t.amount;
        breakdown[t.category].count += 1;
      }
    });
    return Object.entries(breakdown)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 5);
  }, [transactions]);

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
                <Text style={styles.summaryStatLabel}>Money In</Text>
                <Text style={[styles.summaryStatValue, { color: Colors.success.main }]}>
                  {formatCurrency(totalIncome)}
                </Text>
                {prevIncome > 0 && (
                  <Text style={styles.summaryStatChange}>
                    Prev: {formatCurrency(prevIncome)}
                  </Text>
                )}
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Money Out</Text>
                <Text style={[styles.summaryStatValue, { color: Colors.error.main }]}>
                  {formatCurrency(totalExpenses)}
                </Text>
                {prevExpenses > 0 && (
                  <Text style={styles.summaryStatChange}>
                    Prev: {formatCurrency(prevExpenses)}
                  </Text>
                )}
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Balance</Text>
                <Text style={[
                  styles.summaryStatValue,
                  balance >= 0 ? { color: Colors.success.main } : { color: Colors.error.main }
                ]}>
                  {formatCurrency(balance)}
                </Text>
                {prevBalance !== 0 && (
                  <Text style={styles.summaryStatChange}>
                    Prev: {formatCurrency(prevBalance)}
                  </Text>
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
                        <Text style={styles.categoryName}>
                          {item.category__name}
                        </Text>
                      </View>
                      <View style={styles.categoryAmount}>
                        <Text style={styles.categoryAmountValue}>{formatCurrency(amount)}</Text>
                        <Badge label={`${percentage}%`} variant="info" size="sm" />
                      </View>
                    </View>
                  );
                })}
              </View>
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
                      <Text style={styles.billName}>{bill.name}</Text>
                      <Text style={styles.billDue}>
                        Due {new Date(bill.due_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <Text style={styles.billAmount}>{formatCurrency(parseFloat(bill.amount))}</Text>
                  </View>
                ))}
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
});
