import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { MenuButton } from '@/components/menu-button';
import { formatCurrency, formatDateRelative } from '@/utils/helpers';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { router, useFocusEffect } from 'expo-router';
import { useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTransactions } from '@/contexts/transactions-context';
import { Transaction } from '@/services/api/types';

export default function TransactionsScreen() {
  const { transactions, isLoading, deleteTransaction: deleteTransactionFromContext, refreshTransactions } = useTransactions();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const params = filter !== 'all' ? { type: filter } : undefined;
      refreshTransactions(params);
    }, [filter, refreshTransactions])
  );

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (filter !== 'all' && t.type !== filter) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            t.description?.toLowerCase().includes(query) ||
            t.merchant_name?.toLowerCase().includes(query) ||
            t.category_name?.toLowerCase().includes(query) ||
            t.notes?.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter, searchQuery]);

  const handleDeleteTransaction = async (id: number, description: string) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${description || 'this transaction'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransactionFromContext(id);
              Alert.alert('Success', 'Transaction deleted successfully');
            } catch (error: any) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', error.message || 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleEditTransaction = (transaction: Transaction) => {
    router.push({
      pathname: '/transactions/add',
      params: {
        id: transaction.id.toString(),
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        category: transaction.category.toString(),
        merchant: transaction.merchant?.toString() || '',
        description: transaction.description || '',
        notes: transaction.notes || '',
        is_recurring: transaction.is_recurring?.toString() || 'false',
        recurring_frequency: transaction.recurring_frequency || '',
      },
    });
  };

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
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/transactions/add')}
        >
          <MaterialIcons name="add" size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <ThemedText style={styles.loadingText}>Loading transactions...</ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} variant="elevated" style={styles.transactionCard}>
              <TouchableOpacity
                style={styles.transactionContent}
                onPress={() => handleEditTransaction(transaction)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.categoryIndicator,
                  { backgroundColor: transaction.type === 'income' ? Colors.success.main : Colors.error.main }
                ]} />
                
                <View style={styles.transactionInfo}>
                  <View style={styles.transactionHeader}>
                    <ThemedText style={styles.transactionDescription} numberOfLines={1}>
                      {transaction.description || 'No description'}
                    </ThemedText>
                    <ThemedText style={[
                      styles.transactionAmount,
                      transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                    ]}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.transactionMeta}>
                    {transaction.category_name && (
                      <>
                        <View style={styles.metaItem}>
                          <MaterialIcons 
                            name="label" 
                            size={14} 
                            color={Colors.text.secondary} 
                          />
                          <ThemedText style={styles.transactionCategory}>
                            {transaction.category_name}
                          </ThemedText>
                        </View>
                      </>
                    )}
                    
                    {transaction.merchant_name && (
                      <>
                        {transaction.category_name && <View style={styles.metaSeparator} />}
                        <View style={styles.metaItem}>
                          <MaterialIcons 
                            name="store" 
                            size={14} 
                            color={Colors.text.secondary} 
                          />
                          <ThemedText style={styles.transactionMerchant}>
                            {transaction.merchant_name}
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
                      {formatDateRelative(new Date(transaction.date))}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
              <View style={styles.transactionActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditTransaction(transaction)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="edit" size={18} color={Colors.primary[600]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteTransaction(transaction.id, transaction.description || '')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="delete" size={18} color={Colors.error.main} />
                </TouchableOpacity>
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
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => router.push('/transactions/add')}
                >
                  <ThemedText style={styles.emptyButtonText}>Add Transaction</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
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
  transactionActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.sm,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.gray[50],
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
