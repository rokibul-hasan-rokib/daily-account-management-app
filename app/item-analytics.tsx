import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuButton } from '@/components/menu-button';
import { formatCurrency, formatDate, getPeriodDates } from '@/utils/helpers';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState, useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ReceiptItemsService } from '@/services/api';
import { ItemAnalyticsResponse } from '@/services/api/types';

export default function ItemAnalyticsScreen() {
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState<ItemAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { start, end } = getPeriodDates(period);
  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  // Fetch analytics from API
  useEffect(() => {
    loadAnalytics();
  }, [period, startDate, endDate, searchQuery]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const params = {
        start_date: startDate,
        end_date: endDate,
        ...(searchQuery && { search: searchQuery }),
      };
      const data = await ReceiptItemsService.getItemAnalytics(params);
      setAnalytics(data);
    } catch (error: any) {
      console.error('Error loading item analytics:', error);
      Alert.alert('Error', 'Failed to load item analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter top items based on search
  const filteredTopItems = useMemo(() => {
    if (!analytics) return [];
    if (!searchQuery) return analytics.top_items.slice(0, 5);
    return analytics.top_items
      .filter(item => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [analytics, searchQuery]);

  const totalSpend = useMemo(() => {
    if (!analytics) return 0;
    return analytics.top_items.reduce((sum, item) => sum + parseFloat(item.total_spent), 0);
  }, [analytics]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Item Analytics</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Track spending on individual items
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Period Filter */}
      <View style={styles.periodFilter}>
        {(['week', 'month'] as const).map((p) => (
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
              This {p.charAt(0).toUpperCase() + p.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Total Spend Card */}
      <Card variant="elevated" style={styles.totalCard}>
        <View style={styles.totalCardContent}>
          <MaterialIcons name="shopping-bag" size={32} color={Colors.text.inverse} />
          <ThemedText style={styles.totalLabel}>Total Item Spend</ThemedText>
          <ThemedText style={styles.totalValue}>{formatCurrency(totalSpend)}</ThemedText>
          {analytics && (
            <ThemedText style={styles.totalSubtext}>
              Across {analytics.total_items || analytics.top_items.length} different items
            </ThemedText>
          )}
        </View>
      </Card>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <MaterialIcons name="search" size={20} color={Colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items (e.g., Beef, Milk)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.tertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <ThemedText style={styles.loadingText}>Loading analytics...</ThemedText>
        </View>
      ) : analytics ? (
        <>
          {/* Top Items Summary */}
          {filteredTopItems.length > 0 && (
            <Card variant="elevated" style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons name="star" size={20} color={Colors.warning.main} />
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Top Items by Spend
                </ThemedText>
              </View>
              <View style={styles.itemsList}>
                {filteredTopItems.map((item, index) => {
                  const percentage = totalSpend > 0 ? (parseFloat(item.total_spent) / totalSpend) * 100 : 0;
                  return (
                    <View key={item.item_name} style={styles.itemCard}>
                      <View style={styles.itemRank}>
                        <View style={[
                          styles.rankCircle,
                          index === 0 && styles.rankCircleGold,
                          index === 1 && styles.rankCircleSilver,
                          index === 2 && styles.rankCircleBronze,
                        ]}>
                          <ThemedText style={styles.rankText}>#{index + 1}</ThemedText>
                        </View>
                      </View>

                      <View style={styles.itemContent}>
                        <View style={styles.itemHeader}>
                          <ThemedText style={styles.itemName}>{item.item_name}</ThemedText>
                        </View>

                        <View style={styles.itemStats}>
                          <View style={styles.statItem}>
                            <MaterialIcons name="attach-money" size={16} color={Colors.text.secondary} />
                            <ThemedText style={styles.statLabel}>Total</ThemedText>
                            <ThemedText style={styles.statValue}>
                              {formatCurrency(parseFloat(item.total_spent))}
                            </ThemedText>
                          </View>

                          <View style={styles.statItem}>
                            <MaterialIcons name="inventory" size={16} color={Colors.text.secondary} />
                            <ThemedText style={styles.statLabel}>Count</ThemedText>
                            <ThemedText style={styles.statValue}>
                              {item.count}
                            </ThemedText>
                          </View>
                        </View>

                        <View style={styles.itemMeta}>
                          <ThemedText style={styles.itemMetaText}>
                            {percentage.toFixed(1)}% of total spend
                          </ThemedText>
                          <View style={styles.metaSeparator} />
                          <ThemedText style={styles.itemMetaText}>
                            {item.count} purchase{item.count !== 1 ? 's' : ''}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}

          {/* Category Breakdown */}
          {analytics.category_breakdown && analytics.category_breakdown.length > 0 && (
            <Card variant="elevated" style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons name="category" size={20} color={Colors.primary[600]} />
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Category Breakdown
                </ThemedText>
              </View>
              <View style={styles.compactList}>
                {analytics.category_breakdown.map((cat, index) => (
                  <View key={index} style={styles.compactItemRow}>
                    <View style={styles.compactItemInfo}>
                      <ThemedText style={styles.compactItemName}>{cat.category__name}</ThemedText>
                      <ThemedText style={styles.compactItemMeta}>
                        {cat.count} items
                      </ThemedText>
                    </View>
                    <View style={styles.compactItemAmount}>
                      <ThemedText style={styles.compactItemSpend}>
                        {formatCurrency(typeof cat.total === 'string' ? parseFloat(cat.total) : cat.total)}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Recent Items */}
          {analytics.recent_items && analytics.recent_items.length > 0 && (
            <Card variant="elevated" style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcons name="schedule" size={20} color={Colors.primary[600]} />
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Recent Items
                </ThemedText>
              </View>
              <View style={styles.compactList}>
                {analytics.recent_items.map((item, index) => (
                  <View key={index} style={styles.compactItemRow}>
                    <View style={styles.compactItemInfo}>
                      <ThemedText style={styles.compactItemName}>{item.item_name}</ThemedText>
                      <ThemedText style={styles.compactItemMeta}>
                        {formatDate(new Date(item.last_purchase_date))}
                      </ThemedText>
                    </View>
                    <View style={styles.compactItemAmount}>
                      <ThemedText style={styles.compactItemSpend}>
                        {formatCurrency(parseFloat(item.total_spent))}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </>
      ) : (
        <Card variant="outlined" style={styles.emptyCard}>
          <MaterialIcons name="receipt-long" size={48} color={Colors.text.tertiary} />
          <ThemedText style={styles.emptyText}>No item data available</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Start scanning receipts to see item analytics
          </ThemedText>
        </Card>
      )}

      {/* Info Box */}
      <Card variant="outlined" style={styles.infoBox}>
        <View style={styles.infoHeader}>
          <MaterialIcons name="info" size={20} color={Colors.warning.main} />
          <ThemedText style={styles.infoTitle}>How this works</ThemedText>
        </View>
        <ThemedText style={styles.infoText}>
          Item analytics tracks individual products from your receipts. 
          When you scan receipts (coming soon), each line item is tracked separately, 
          giving you insights into price trends and spending patterns per item.
        </ThemedText>
        <ThemedText style={styles.infoText}>
          Example: "Beef cost increased 22% this month vs last month."
        </ThemedText>
      </Card>
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
  totalCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
    backgroundColor: Colors.primary[500],
  },
  totalCardContent: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.inverse,
    opacity: 0.9,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  totalValue: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  totalSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.inverse,
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadows.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    paddingVertical: 0,
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
  itemsList: {
    gap: Spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  itemRank: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankCircleGold: {
    backgroundColor: Colors.warning.light,
  },
  rankCircleSilver: {
    backgroundColor: Colors.gray[300],
  },
  rankCircleBronze: {
    backgroundColor: '#FED7AA',
  },
  rankText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.text.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  itemName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  statValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  itemMetaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  metaSeparator: {
    marginHorizontal: Spacing.sm,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray[300],
  },
  lastPurchaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  lastPurchase: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  compactList: {
    gap: Spacing.md,
  },
  compactItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  compactItemInfo: {
    flex: 1,
  },
  compactItemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  compactItemMeta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  compactItemAmount: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  compactItemSpend: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  infoBox: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    padding: Spacing.lg,
    backgroundColor: Colors.warning.light,
    borderColor: Colors.warning.main,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  loadingContainer: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
