import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Summary {
  id: string;
  title: string;
  period: string;
  type: 'monthly' | 'weekly' | 'custom';
  createdAt: string;
  totalIncome: number;
  totalExpenses: number;
}

const dummySummaries: Summary[] = [
  { id: '1', title: 'January 2024 Summary', period: 'Jan 1 - Jan 31, 2024', type: 'monthly', createdAt: '2 days ago', totalIncome: 5000, totalExpenses: 3200 },
  { id: '2', title: 'December 2023 Summary', period: 'Dec 1 - Dec 31, 2023', type: 'monthly', createdAt: '1 month ago', totalIncome: 4800, totalExpenses: 3500 },
  { id: '3', title: 'Week 1 Summary', period: 'Jan 1 - Jan 7, 2024', type: 'weekly', createdAt: '2 weeks ago', totalIncome: 1200, totalExpenses: 800 },
];

export default function SummariesScreen() {
  const [summaries] = useState<Summary[]>(dummySummaries);
  const [filter, setFilter] = useState<'all' | 'monthly' | 'weekly'>('all');

  const filteredSummaries = summaries.filter(summary =>
    filter === 'all' || summary.type === filter
  );

  const handleExport = (id: string) => {
    console.log('Exporting summary:', id);
    alert('Export functionality coming soon!');
  };

  const handleGenerate = () => {
    alert('Generate summary functionality coming soon!');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Summaries</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              View and export financial summaries
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
          <MaterialIcons name="add" size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        {(['all', 'monthly', 'weekly'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <ThemedText style={[
              styles.filterButtonText,
              filter === f && styles.filterButtonTextActive
            ]}>
              {f === 'all' ? 'All' : f === 'monthly' ? 'Monthly' : 'Weekly'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summaries List */}
      <View style={styles.summariesList}>
        {filteredSummaries.map((summary) => (
          <Card key={summary.id} variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIcon}>
                <MaterialIcons name="description" size={24} color={Colors.primary[600]} />
              </View>
              <View style={styles.summaryInfo}>
                <ThemedText style={styles.summaryTitle}>{summary.title}</ThemedText>
                <ThemedText style={styles.summaryPeriod}>{summary.period}</ThemedText>
                <ThemedText style={styles.summaryDate}>Created {summary.createdAt}</ThemedText>
              </View>
            </View>

            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <MaterialIcons name="trending-up" size={20} color={Colors.success.main} />
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Income</Text>
                  <Text style={[styles.statValue, { color: Colors.success.main }]}>
                    £{summary.totalIncome.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="trending-down" size={20} color={Colors.error.main} />
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Expenses</Text>
                  <Text style={[styles.statValue, { color: Colors.error.main }]}>
                    £{summary.totalExpenses.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="account-balance-wallet" size={20} color={Colors.primary[600]} />
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Net</Text>
                  <Text style={[styles.statValue, { 
                    color: (summary.totalIncome - summary.totalExpenses) >= 0 
                      ? Colors.success.main 
                      : Colors.error.main 
                  }]}>
                    £{(summary.totalIncome - summary.totalExpenses).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <Button
              title="Export PDF"
              variant="outline"
              onPress={() => handleExport(summary.id)}
              style={styles.exportButton}
            />
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
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
  generateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    ...Shadows.sm,
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
  summariesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  summaryPeriod: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  summaryDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gray[200],
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  exportButton: {
    width: '100%',
  },
});
