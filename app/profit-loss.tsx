import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { MenuButton } from '@/components/menu-button';
import { dummyTransactions, getTotalExpenses, getTotalIncome } from '@/data/dummy-data';
import { formatCurrency, getCategoryColor, getCategoryLabel, getPeriodDates } from '@/utils/helpers';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ProfitLossScreen() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');

  const { start, end } = getPeriodDates(period);
  const transactions = dummyTransactions.filter(t => t.date >= start && t.date <= end);
  
  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const profitLoss = totalIncome - totalExpenses;

  // Group by category
  const incomeByCategory: Record<string, number> = {};
  const expensesByCategory: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.type === 'income') {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    } else {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    }
  });

  const incomeCategories = Object.entries(incomeByCategory)
    .sort((a, b) => b[1] - a[1]);
  
  const expenseCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1]);

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
              name={profitLoss >= 0 ? "check-circle" : "cancel"} 
              size={24} 
              color={profitLoss >= 0 ? Colors.success.main : Colors.error.main} 
            />
            <ThemedText style={[styles.summaryLabel, styles.profitLabel]}>
              Net Profit / Loss
            </ThemedText>
          </View>
          <ThemedText style={[
            styles.summaryValue,
            styles.profitValue,
            profitLoss >= 0 ? styles.profitPositive : styles.profitNegative
          ]}>
            {formatCurrency(profitLoss)}
          </ThemedText>
        </View>
      </Card>

      {/* Income Breakdown */}
      {incomeCategories.length > 0 && (
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="account-balance-wallet" size={20} color={Colors.success.main} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Income Breakdown
            </ThemedText>
          </View>
          <View style={styles.categoriesList}>
            {incomeCategories.map(([category, amount]) => (
              <View key={category} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={[
                    styles.categoryDot,
                    { backgroundColor: getCategoryColor(category) }
                  ]} />
                  <ThemedText style={styles.categoryName}>
                    {getCategoryLabel(category)}
                  </ThemedText>
                </View>
                <View style={styles.categoryAmountContainer}>
                  <ThemedText style={styles.categoryAmount}>
                    {formatCurrency(amount)}
                  </ThemedText>
                  <ThemedText style={styles.categoryPercentage}>
                    {((amount / totalIncome) * 100).toFixed(0)}%
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Expenses Breakdown */}
      {expenseCategories.length > 0 && (
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="shopping-cart" size={20} color={Colors.error.main} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Expenses Breakdown
            </ThemedText>
          </View>
          <View style={styles.categoriesList}>
            {expenseCategories.map(([category, amount]) => (
              <View key={category} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={[
                    styles.categoryDot,
                    { backgroundColor: getCategoryColor(category) }
                  ]} />
                  <ThemedText style={styles.categoryName}>
                    {getCategoryLabel(category)}
                  </ThemedText>
                </View>
                <View style={styles.categoryAmountContainer}>
                  <ThemedText style={styles.categoryAmount}>
                    {formatCurrency(amount)}
                  </ThemedText>
                  <ThemedText style={styles.categoryPercentage}>
                    {((amount / totalExpenses) * 100).toFixed(0)}%
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </Card>
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
});
