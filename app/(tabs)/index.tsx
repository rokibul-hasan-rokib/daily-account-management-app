import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  dummyTransactions,
  getTotalExpenses,
  getTotalIncome,
  getUpcomingLiabilities
} from '@/data/dummy-data';
import { formatCurrency, generateInsights, getPeriodDates } from '@/utils/helpers';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');
  
  // Calculate current period data
  const { start, end } = getPeriodDates(period);
  const currentTransactions = dummyTransactions.filter(
    t => t.date >= start && t.date <= end
  );
  
  const totalIncome = getTotalIncome(currentTransactions);
  const totalExpenses = getTotalExpenses(currentTransactions);
  const balance = totalIncome - totalExpenses;
  const profitLoss = totalIncome - totalExpenses;
  
  // Calculate previous period for comparison
  const prevStart = new Date(start);
  const prevEnd = new Date(start);
  const periodLength = end.getTime() - start.getTime();
  prevStart.setTime(start.getTime() - periodLength);
  
  const previousTransactions = dummyTransactions.filter(
    t => t.date >= prevStart && t.date < start
  );
  
  const insights = generateInsights(currentTransactions, previousTransactions);
  const upcomingBills = getUpcomingLiabilities();
  
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Cash Flow</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Quick snapshot of your finances
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

      {/* Main Metrics */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, styles.incomeCard]}>
          <ThemedText style={styles.metricLabel}>Money In</ThemedText>
          <ThemedText style={styles.metricValue}>{formatCurrency(totalIncome)}</ThemedText>
        </View>
        
        <View style={[styles.metricCard, styles.expenseCard]}>
          <ThemedText style={styles.metricLabel}>Money Out</ThemedText>
          <ThemedText style={styles.metricValue}>{formatCurrency(totalExpenses)}</ThemedText>
        </View>
        
        <View style={[styles.metricCard, styles.balanceCard]}>
          <ThemedText style={styles.metricLabel}>Balance</ThemedText>
          <ThemedText style={[
            styles.metricValue,
            balance >= 0 ? styles.positiveValue : styles.negativeValue
          ]}>
            {formatCurrency(balance)}
          </ThemedText>
        </View>
        
        <View style={[styles.metricCard, styles.profitCard]}>
          <ThemedText style={styles.metricLabel}>Profit/Loss</ThemedText>
          <ThemedText style={[
            styles.metricValue,
            profitLoss >= 0 ? styles.positiveValue : styles.negativeValue
          ]}>
            {formatCurrency(profitLoss)}
          </ThemedText>
        </View>
      </View>

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Upcoming Bills</ThemedText>
            <Link href="/bills" asChild>
              <TouchableOpacity>
                <ThemedText style={styles.seeAllLink}>See all</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
          {upcomingBills.slice(0, 3).map((bill) => (
            <View key={bill.id} style={styles.billItem}>
              <View style={styles.billInfo}>
                <ThemedText style={styles.billName}>{bill.name}</ThemedText>
                <ThemedText style={styles.billDue}>
                  Due {bill.dueDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                </ThemedText>
              </View>
              <ThemedText style={styles.billAmount}>{formatCurrency(bill.amount)}</ThemedText>
            </View>
          ))}
        </ThemedView>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Insights</ThemedText>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <ThemedText style={styles.insightText}>• {insight}</ThemedText>
            </View>
          ))}
        </ThemedView>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Link href="/transactions/add" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <ThemedText style={styles.actionButtonText}>+ Add Transaction</ThemedText>
          </TouchableOpacity>
        </Link>
        
        <Link href="/transactions" asChild>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
            <ThemedText style={styles.actionButtonTextSecondary}>View All</ThemedText>
          </TouchableOpacity>
        </Link>
      </View>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  incomeCard: {
    backgroundColor: '#d1fae5',
  },
  expenseCard: {
    backgroundColor: '#fee2e2',
  },
  balanceCard: {
    backgroundColor: '#dbeafe',
  },
  profitCard: {
    backgroundColor: '#e9d5ff',
  },
  metricLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  positiveValue: {
    color: '#10b981',
  },
  negativeValue: {
    color: '#ef4444',
  },
  section: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  billDue: {
    fontSize: 14,
    opacity: 0.6,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  insightItem: {
    paddingVertical: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
});

