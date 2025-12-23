import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { dummyTransactions, getTotalExpenses, getTotalIncome } from '@/data/dummy-data';
import { formatCurrency, getCategoryColor, getCategoryLabel, getPeriodDates } from '@/utils/helpers';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Profit & Loss</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Income minus expenses for the period
        </ThemedText>
      </ThemedView>

      {/* Period Filter */}
      <View style={styles.periodFilter}>
        {(['today', 'week', 'month'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
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
      <ThemedView style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryLabel}>Total Income</ThemedText>
          <ThemedText style={[styles.summaryValue, styles.incomeValue]}>
            {formatCurrency(totalIncome)}
          </ThemedText>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryLabel}>Total Expenses</ThemedText>
          <ThemedText style={[styles.summaryValue, styles.expenseValue]}>
            {formatCurrency(totalExpenses)}
          </ThemedText>
        </View>

        <View style={[styles.divider, styles.dividerThick]} />

        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, styles.profitLabel]}>
            Profit / Loss
          </ThemedText>
          <ThemedText style={[
            styles.summaryValue,
            styles.profitValue,
            profitLoss >= 0 ? styles.profitPositive : styles.profitNegative
          ]}>
            {formatCurrency(profitLoss)}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Income Breakdown */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Income Breakdown
        </ThemedText>
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
      </ThemedView>

      {/* Expenses Breakdown */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Expenses Breakdown
        </ThemedText>
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
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  periodFilter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  periodButtonActive: {
    backgroundColor: '#3b82f6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  incomeValue: {
    color: '#10b981',
  },
  expenseValue: {
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  dividerThick: {
    height: 2,
    backgroundColor: '#cbd5e1',
  },
  profitLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  profitValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  profitPositive: {
    color: '#10b981',
  },
  profitNegative: {
    color: '#ef4444',
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#64748b',
  },
});
