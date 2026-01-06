import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { MenuButton } from '@/components/menu-button';
import { dummyTransactions } from '@/data/dummy-data';
import { formatCurrency, formatDateRelative, getCategoryColor, getCategoryLabel } from '@/utils/helpers';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TransactionsScreen() {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = dummyTransactions
    .filter(t => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          t.description.toLowerCase().includes(query) ||
          t.merchantName?.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Transactions</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </ThemedText>
          </View>
        </View>
        <Link href="/transactions/add" asChild>
          <TouchableOpacity style={styles.addButton}>
            <MaterialIcons name="add" size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <MaterialIcons name="search" size={20} color={Colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
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

      {/* Filter */}
      <View style={styles.filterContainer}>
        {(['all', 'income', 'expense'] as const).map((f) => (
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
              {f === 'all' ? 'All' : f === 'income' ? 'Income' : 'Expenses'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredTransactions.map((transaction, index) => (
          <Card key={transaction.id} variant="elevated" style={styles.transactionCard}>
            <View style={styles.transactionContent}>
              <View style={[
                styles.categoryIndicator,
                { backgroundColor: getCategoryColor(transaction.category) }
              ]} />
              
              <View style={styles.transactionInfo}>
                <View style={styles.transactionHeader}>
                  <ThemedText style={styles.transactionDescription} numberOfLines={1}>
                    {transaction.description}
                  </ThemedText>
                  <ThemedText style={[
                    styles.transactionAmount,
                    transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </ThemedText>
                </View>
                
                <View style={styles.transactionMeta}>
                  <View style={styles.metaItem}>
                    <MaterialIcons 
                      name="label" 
                      size={14} 
                      color={Colors.text.secondary} 
                    />
                    <ThemedText style={styles.transactionCategory}>
                      {getCategoryLabel(transaction.category)}
                    </ThemedText>
                  </View>
                  
                  {transaction.merchantName && (
                    <>
                      <View style={styles.metaSeparator} />
                      <View style={styles.metaItem}>
                        <MaterialIcons 
                          name="store" 
                          size={14} 
                          color={Colors.text.secondary} 
                        />
                        <ThemedText style={styles.transactionMerchant}>
                          {transaction.merchantName}
                        </ThemedText>
                      </View>
                    </>
                  )}
                </View>
                
                <View style={styles.transactionFooter}>
                  <MaterialIcons 
                    name="schedule" 
                    size={14} 
                    color={Colors.text.tertiary} 
                  />
                  <ThemedText style={styles.transactionDate}>
                    {formatDateRelative(transaction.date)}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>
        ))}

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={64} color={Colors.text.tertiary} />
            <ThemedText style={styles.emptyTitle}>No transactions found</ThemedText>
            <ThemedText style={styles.emptyText}>
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Add your first transaction to get started'}
            </ThemedText>
            {!searchQuery && filter === 'all' && (
              <Link href="/transactions/add" asChild>
                <TouchableOpacity style={styles.emptyButton}>
                  <ThemedText style={styles.emptyButtonText}>Add Transaction</ThemedText>
                </TouchableOpacity>
              </Link>
            )}
          </View>
        )}
      </ScrollView>
    </View>
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
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
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
  list: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  transactionCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  transactionContent: {
    flexDirection: 'row',
  },
  categoryIndicator: {
    width: 4,
  },
  transactionInfo: {
    flex: 1,
    padding: Spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  transactionDescription: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  transactionAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  incomeAmount: {
    color: Colors.success.main,
  },
  expenseAmount: {
    color: Colors.error.main,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray[300],
    marginHorizontal: Spacing.sm,
  },
  transactionCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  transactionMerchant: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  transactionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});
