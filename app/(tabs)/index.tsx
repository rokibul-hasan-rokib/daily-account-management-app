import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { MenuButton } from '@/components/menu-button';
import { DateRangePicker } from '@/components/date-range-picker';
import { formatCurrency, getPeriodDates } from '@/utils/helpers';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { router, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AnalyticsService } from '@/services/api';
import { DashboardSummary } from '@/services/api/types';

// Helper to format date to YYYY-MM-DD
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DashboardScreen() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate current period dates
  const { start, end } = period === 'custom' && customDateRange
    ? customDateRange
    : getPeriodDates(period as 'today' | 'week' | 'month');

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        range: period === 'custom' ? 'custom' : period,
      };
      
      if (period === 'custom' && customDateRange) {
        params.start_date = formatDateForAPI(customDateRange.start);
        params.end_date = formatDateForAPI(customDateRange.end);
      }
      
      const data = await AnalyticsService.getDashboardSummary(params);
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      // Keep existing data on error
    } finally {
      setIsLoading(false);
    }
  }, [period, customDateRange]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );
  
  const handleCustomDateRange = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setPeriod('custom');
  };

  const totalIncome = dashboardData ? parseFloat(dashboardData.income) : 0;
  const totalExpenses = dashboardData ? parseFloat(dashboardData.expenses) : 0;
  const balance = dashboardData ? parseFloat(dashboardData.balance) : 0;
  const totalBalance = dashboardData ? parseFloat(dashboardData.total_balance) : 0;
  const totalBillsDue = dashboardData ? parseFloat(dashboardData.total_bills_due) : 0;
  
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

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
        </View>
      ) : (
        <>
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
                <ThemedText style={styles.metricLabel}>Total Balance</ThemedText>
              </View>
              <ThemedText style={[
                styles.metricValue,
                totalBalance >= 0 ? { color: Colors.success.main } : { color: Colors.error.main }
              ]}>
                {formatCurrency(totalBalance)}
              </ThemedText>
            </Card>
          </View>

          {/* Bills Due */}
          {totalBillsDue > 0 && (
            <Card variant="elevated" style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <MaterialIcons name="event" size={20} color={Colors.warning.main} />
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Bills Due
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={() => router.push('/bills')}>
                  <ThemedText style={styles.seeAllLink}>View All</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.billsSummary}>
                <ThemedText style={styles.billsAmount}>{formatCurrency(totalBillsDue)}</ThemedText>
                <ThemedText style={styles.billsText}>Total bills due</ThemedText>
              </View>
            </Card>
          )}
        </>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.primaryAction}
          onPress={() => router.push('/transactions/add')}
        >
          <MaterialIcons name="add-circle" size={24} color={Colors.text.inverse} />
          <ThemedText style={styles.primaryActionText}>Add Transaction</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryAction}
          onPress={() => router.push('/transactions')}
        >
          <ThemedText style={styles.secondaryActionText}>View All Transactions</ThemedText>
        </TouchableOpacity>
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
    paddingVertical: Spacing.sm + 2,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    ...Shadows.sm,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[600],
    ...Shadows.md,
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
    borderWidth: 1,
    borderColor: Colors.gray[100],
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
  billsSummary: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  billsAmount: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.warning.main,
    marginBottom: Spacing.xs,
  },
  billsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
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
