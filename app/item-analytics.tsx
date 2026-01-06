import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuButton } from '@/components/menu-button';
import { dummyReceiptItems, dummyReceipts } from '@/data/dummy-data';
import { formatCurrency, formatDate, getPeriodDates } from '@/utils/helpers';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ItemSummary {
  itemName: string;
  totalSpend: number;
  totalQuantity: number;
  averagePrice: number;
  transactionCount: number;
  percentageOfTotal: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  lastPurchase: Date;
}

export default function ItemAnalyticsScreen() {
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [searchQuery, setSearchQuery] = useState('');

  const { start, end } = getPeriodDates(period);

  // Get previous period for comparison
  const prevStart = new Date(start);
  const prevEnd = new Date(start);
  const periodLength = end.getTime() - start.getTime();
  prevStart.setTime(start.getTime() - periodLength);

  // Calculate item analytics
  const itemAnalytics = useMemo(() => {
    // Current period items
    const currentReceipts = dummyReceipts.filter(r => r.date >= start && r.date <= end);
    const currentReceiptIds = currentReceipts.map(r => r.id);
    const currentItems = dummyReceiptItems.filter(item => currentReceiptIds.includes(item.receiptId));

    // Previous period items
    const previousReceipts = dummyReceipts.filter(r => r.date >= prevStart && r.date < start);
    const previousReceiptIds = previousReceipts.map(r => r.id);
    const previousItems = dummyReceiptItems.filter(item => previousReceiptIds.includes(item.receiptId));

    // Group current items by name
    const itemGroups: Record<string, {
      totalSpend: number;
      totalQuantity: number;
      prices: number[];
      dates: Date[];
    }> = {};

    currentItems.forEach(item => {
      const name = item.itemName;
      if (!itemGroups[name]) {
        itemGroups[name] = {
          totalSpend: 0,
          totalQuantity: 0,
          prices: [],
          dates: [],
        };
      }
      itemGroups[name].totalSpend += item.totalPrice;
      itemGroups[name].totalQuantity += item.quantity;
      itemGroups[name].prices.push(item.unitPrice);
      
      const receipt = currentReceipts.find(r => r.id === item.receiptId);
      if (receipt) {
        itemGroups[name].dates.push(receipt.date);
      }
    });

    // Group previous items for trend calculation
    const previousItemGroups: Record<string, number> = {};
    previousItems.forEach(item => {
      previousItemGroups[item.itemName] = 
        (previousItemGroups[item.itemName] || 0) + item.totalPrice;
    });

    const totalSpend = Object.values(itemGroups).reduce((sum, g) => sum + g.totalSpend, 0);

    // Convert to array with analytics
    const analytics: ItemSummary[] = Object.entries(itemGroups).map(([name, data]) => {
      const averagePrice = data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length;
      const previousSpend = previousItemGroups[name] || 0;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let trendPercentage = 0;
      
      if (previousSpend > 0) {
        trendPercentage = ((data.totalSpend - previousSpend) / previousSpend) * 100;
        if (Math.abs(trendPercentage) > 5) {
          trend = trendPercentage > 0 ? 'up' : 'down';
        }
      } else if (data.totalSpend > 0) {
        trend = 'up';
        trendPercentage = 100;
      }

      return {
        itemName: name,
        totalSpend: data.totalSpend,
        totalQuantity: data.totalQuantity,
        averagePrice,
        transactionCount: data.dates.length,
        percentageOfTotal: (data.totalSpend / totalSpend) * 100,
        trend,
        trendPercentage: Math.abs(trendPercentage),
        lastPurchase: new Date(Math.max(...data.dates.map(d => d.getTime()))),
      };
    });

    return analytics.sort((a, b) => b.totalSpend - a.totalSpend);
  }, [period, start, end, prevStart]);

  // Filter items based on search
  const filteredItems = itemAnalytics.filter(item =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topItems = filteredItems.slice(0, 5);
  const totalSpend = itemAnalytics.reduce((sum, item) => sum + item.totalSpend, 0);

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
          <ThemedText style={styles.totalSubtext}>
            Across {itemAnalytics.length} different items
          </ThemedText>
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

      {/* Top Items Summary */}
      {topItems.length > 0 && (
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="star" size={20} color={Colors.warning.main} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Top Items by Spend
            </ThemedText>
          </View>
          <View style={styles.itemsList}>
            {topItems.map((item, index) => (
              <View key={item.itemName} style={styles.itemCard}>
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
                    <ThemedText style={styles.itemName}>{item.itemName}</ThemedText>
                    <Badge
                      label={`${item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} ${item.trendPercentage.toFixed(0)}%`}
                      variant={item.trend === 'up' ? 'error' : item.trend === 'down' ? 'success' : 'default'}
                      size="sm"
                    />
                  </View>

                  <View style={styles.itemStats}>
                    <View style={styles.statItem}>
                      <MaterialIcons name="attach-money" size={16} color={Colors.text.secondary} />
                      <ThemedText style={styles.statLabel}>Total</ThemedText>
                      <ThemedText style={styles.statValue}>
                        {formatCurrency(item.totalSpend)}
                      </ThemedText>
                    </View>

                    <View style={styles.statItem}>
                      <MaterialIcons name="inventory" size={16} color={Colors.text.secondary} />
                      <ThemedText style={styles.statLabel}>Quantity</ThemedText>
                      <ThemedText style={styles.statValue}>
                        {item.totalQuantity.toFixed(1)}
                      </ThemedText>
                    </View>

                    <View style={styles.statItem}>
                      <MaterialIcons name="calculate" size={16} color={Colors.text.secondary} />
                      <ThemedText style={styles.statLabel}>Avg Price</ThemedText>
                      <ThemedText style={styles.statValue}>
                        {formatCurrency(item.averagePrice)}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.itemMeta}>
                    <ThemedText style={styles.itemMetaText}>
                      {item.percentageOfTotal.toFixed(1)}% of total spend
                    </ThemedText>
                    <View style={styles.metaSeparator} />
                    <ThemedText style={styles.itemMetaText}>
                      {item.transactionCount} purchase{item.transactionCount !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>

                  <View style={styles.lastPurchaseContainer}>
                    <MaterialIcons name="schedule" size={14} color={Colors.text.tertiary} />
                    <ThemedText style={styles.lastPurchase}>
                      Last purchased: {formatDate(item.lastPurchase)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* All Items List */}
      {searchQuery && filteredItems.length > 0 && (
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="list" size={20} color={Colors.primary[600]} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Search Results ({filteredItems.length})
            </ThemedText>
          </View>
          <View style={styles.compactList}>
            {filteredItems.map((item) => (
              <View key={item.itemName} style={styles.compactItemRow}>
                <View style={styles.compactItemInfo}>
                  <ThemedText style={styles.compactItemName}>{item.itemName}</ThemedText>
                  <ThemedText style={styles.compactItemMeta}>
                    Qty: {item.totalQuantity.toFixed(1)} • {item.transactionCount} purchase{item.transactionCount !== 1 ? 's' : ''}
                  </ThemedText>
                </View>
                <View style={styles.compactItemAmount}>
                  <ThemedText style={styles.compactItemSpend}>
                    {formatCurrency(item.totalSpend)}
                  </ThemedText>
                  <Badge
                    label={`${item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} ${item.trendPercentage.toFixed(0)}%`}
                    variant={item.trend === 'up' ? 'error' : item.trend === 'down' ? 'success' : 'default'}
                    size="sm"
                  />
                </View>
              </View>
            ))}
          </View>
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
});
