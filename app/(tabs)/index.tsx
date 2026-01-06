import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuButton } from '@/components/menu-button';
import { DateRangePicker } from '@/components/date-range-picker';
import {
  dummyTransactions,
  getTotalExpenses,
  getTotalIncome,
  getUpcomingLiabilities
} from '@/data/dummy-data';
import { formatCurrency, generateInsights, getPeriodDates } from '@/utils/helpers';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function DashboardScreen() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Calculate current period data
  const { start, end } = period === 'custom' && customDateRange
    ? customDateRange
    : getPeriodDates(period as 'today' | 'week' | 'month');
    
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
  
  const handleCustomDateRange = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setPeriod('custom');
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Dashboard</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Overview of your finances
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Period Filter */}
      <View style={styles.periodFilter}>
        {(['today', 'week', 'month'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => {
              setPeriod(p);
              setCustomDateRange(null);
            }}
            activeOpacity={0.7}
          >
            <ThemedText style={[
              styles.periodButtonText,
              period === p && styles.periodButtonTextActive
            ]}>
              {p === 'today' ? 'Today' : p === 'week' ? 'Week' : 'Month'}
            </ThemedText>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.periodButton, period === 'custom' && styles.periodButtonActive]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="date-range" 
            size={16} 
            color={period === 'custom' ? Colors.text.inverse : Colors.text.secondary} 
          />
          <ThemedText style={[
            styles.periodButtonText,
            period === 'custom' && styles.periodButtonTextActive
          ]}>
            Custom
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Main Metrics Grid */}
      <View style={styles.metricsGrid}>
        <Card variant="elevated" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: Colors.success.light }]}>
              <MaterialIcons name="trending-up" size={24} color={Colors.success.main} />
            </View>
            <ThemedText style={styles.metricLabel}>Money In</ThemedText>
          </View>
          <ThemedText style={[styles.metricValue, { color: Colors.success.main }]}>
            {formatCurrency(totalIncome)}
          </ThemedText>
        </Card>
        
        <Card variant="elevated" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: Colors.error.light }]}>
              <MaterialIcons name="trending-down" size={24} color={Colors.error.main} />
            </View>
            <ThemedText style={styles.metricLabel}>Money Out</ThemedText>
          </View>
          <ThemedText style={[styles.metricValue, { color: Colors.error.main }]}>
            {formatCurrency(totalExpenses)}
          </ThemedText>
        </Card>
        
        <Card variant="elevated" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: Colors.info.light }]}>
              <MaterialIcons name="account-balance-wallet" size={24} color={Colors.info.main} />
            </View>
            <ThemedText style={styles.metricLabel}>Balance</ThemedText>
          </View>
          <ThemedText style={[
            styles.metricValue,
            balance >= 0 ? { color: Colors.success.main } : { color: Colors.error.main }
          ]}>
            {formatCurrency(balance)}
          </ThemedText>
        </Card>
        
        <Card variant="elevated" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: Colors.primary[100] }]}>
              <MaterialIcons name="assessment" size={24} color={Colors.primary[600]} />
            </View>
            <ThemedText style={styles.metricLabel}>Profit/Loss</ThemedText>
          </View>
          <ThemedText style={[
            styles.metricValue,
            profitLoss >= 0 ? { color: Colors.success.main } : { color: Colors.error.main }
          ]}>
            {formatCurrency(profitLoss)}
          </ThemedText>
        </Card>
      </View>

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="event" size={20} color={Colors.primary[600]} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Upcoming Bills
              </ThemedText>
            </View>
            <Link href="/bills" asChild>
              <TouchableOpacity>
                <ThemedText style={styles.seeAllLink}>View All</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
          <View style={styles.billsList}>
            {upcomingBills.slice(0, 3).map((bill, index) => (
              <View key={bill.id} style={styles.billItem}>
                <View style={styles.billInfo}>
                  <ThemedText style={styles.billName}>{bill.name}</ThemedText>
                  <View style={styles.billMeta}>
                    <MaterialIcons name="calendar-today" size={14} color={Colors.text.secondary} />
                    <ThemedText style={styles.billDue}>
                      Due {bill.dueDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.billAmount}>{formatCurrency(bill.amount)}</ThemedText>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="lightbulb" size={20} color={Colors.warning.main} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Insights
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

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Link href="/transactions/add" asChild>
          <TouchableOpacity style={styles.primaryAction}>
            <MaterialIcons name="add-circle" size={24} color={Colors.text.inverse} />
            <ThemedText style={styles.primaryActionText}>Add Transaction</ThemedText>
          </TouchableOpacity>
        </Link>
        
        <Link href="/transactions" asChild>
          <TouchableOpacity style={styles.secondaryAction}>
            <ThemedText style={styles.secondaryActionText}>View All Transactions</ThemedText>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Date Range Picker Modal */}
      {showDatePicker && (
        <DateRangePicker
          onDateRangeSelect={handleCustomDateRange}
          onClose={() => setShowDatePicker(false)}
        />
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  metricLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  metricValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  seeAllLink: {
    color: Colors.primary[600],
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
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
  billMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
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
  insightsList: {
    gap: Spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
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
  quickActions: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  primaryAction: {
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  primaryActionText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  secondaryAction: {
    backgroundColor: Colors.background.light,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  secondaryActionText: {
    color: Colors.primary[600],
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});
