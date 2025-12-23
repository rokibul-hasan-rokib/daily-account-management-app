import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { dummyReceiptItems, dummyReceipts } from '@/data/dummy-data';
import { formatCurrency, formatDate, getPeriodDates } from '@/utils/helpers';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Item Analytics</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Track spending on individual items
        </ThemedText>
      </ThemedView>

      {/* Period Filter */}
      <View style={styles.periodFilter}>
        {(['week', 'month'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
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
      <ThemedView style={styles.totalCard}>
        <ThemedText style={styles.totalLabel}>Total Item Spend</ThemedText>
        <ThemedText style={styles.totalValue}>{formatCurrency(totalSpend)}</ThemedText>
        <ThemedText style={styles.totalSubtext}>
          Across {itemAnalytics.length} different items
        </ThemedText>
      </ThemedView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items (e.g., Beef, Milk)..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Top Items Summary */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Top Items by Spend
        </ThemedText>
        {topItems.map((item, index) => (
          <View key={item.itemName} style={styles.itemCard}>
            <View style={styles.itemRank}>
              <ThemedText style={styles.rankText}>#{index + 1}</ThemedText>
            </View>

            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <ThemedText style={styles.itemName}>{item.itemName}</ThemedText>
                <View style={[
                  styles.trendBadge,
                  item.trend === 'up' && styles.trendUp,
                  item.trend === 'down' && styles.trendDown,
                ]}>
                  <ThemedText style={styles.trendText}>
                    {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} 
                    {item.trendPercentage.toFixed(0)}%
                  </ThemedText>
                </View>
              </View>

              <View style={styles.itemStats}>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>Total Spend</ThemedText>
                  <ThemedText style={styles.statValue}>
                    {formatCurrency(item.totalSpend)}
                  </ThemedText>
                </View>

                <View style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>Quantity</ThemedText>
                  <ThemedText style={styles.statValue}>
                    {item.totalQuantity.toFixed(1)}
                  </ThemedText>
                </View>

                <View style={styles.statItem}>
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
                <ThemedText style={styles.itemMetaSeparator}>•</ThemedText>
                <ThemedText style={styles.itemMetaText}>
                  {item.transactionCount} purchase{item.transactionCount !== 1 ? 's' : ''}
                </ThemedText>
              </View>

              <ThemedText style={styles.lastPurchase}>
                Last purchased: {formatDate(item.lastPurchase)}
              </ThemedText>
            </View>
          </View>
        ))}
      </ThemedView>

      {/* All Items List */}
      {searchQuery && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Search Results ({filteredItems.length})
          </ThemedText>
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
                <View style={[
                  styles.compactTrendBadge,
                  item.trend === 'up' && styles.trendUp,
                  item.trend === 'down' && styles.trendDown,
                ]}>
                  <ThemedText style={styles.compactTrendText}>
                    {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} 
                    {item.trendPercentage.toFixed(0)}%
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </ThemedView>
      )}

      {/* Info Box */}
      <ThemedView style={styles.infoBox}>
        <ThemedText style={styles.infoTitle}>💡 How this works</ThemedText>
        <ThemedText style={styles.infoText}>
          Item analytics tracks individual products from your receipts. 
          When you scan receipts (coming soon), each line item is tracked separately, 
          giving you insights into price trends and spending patterns per item.
        </ThemedText>
        <ThemedText style={styles.infoText}>
          Example: "Beef cost increased 22% this month vs last month."
        </ThemedText>
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
  totalCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  totalSubtext: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
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
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemRank: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  rankText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3b82f6',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  trendUp: {
    backgroundColor: '#fee2e2',
  },
  trendDown: {
    backgroundColor: '#d1fae5',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  itemStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemMetaText: {
    fontSize: 13,
    color: '#64748b',
  },
  itemMetaSeparator: {
    marginHorizontal: 8,
    color: '#cbd5e1',
  },
  lastPurchase: {
    fontSize: 12,
    color: '#94a3b8',
  },
  compactItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  compactItemInfo: {
    flex: 1,
  },
  compactItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  compactItemMeta: {
    fontSize: 13,
    color: '#64748b',
  },
  compactItemAmount: {
    alignItems: 'flex-end',
  },
  compactItemSpend: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  compactTrendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  compactTrendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  infoBox: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#78716c',
    marginBottom: 8,
  },
});
