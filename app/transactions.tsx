import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { dummyTransactions } from '@/data/dummy-data';
import { formatCurrency, formatDateRelative, getCategoryColor, getCategoryLabel } from '@/utils/helpers';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Transactions</ThemedText>
        <Link href="/transactions/add" asChild>
          <TouchableOpacity style={styles.addButton}>
            <ThemedText style={styles.addButtonText}>+ Add</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        {(['all', 'income', 'expense'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <ThemedText style={[
              styles.filterButtonText,
              filter === f && styles.filterButtonTextActive
            ]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <ScrollView style={styles.list}>
        {filteredTransactions.map((transaction) => (
          <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
            <View style={[
              styles.categoryIndicator,
              { backgroundColor: getCategoryColor(transaction.category) }
            ]} />
            
            <View style={styles.transactionInfo}>
              <ThemedText style={styles.transactionDescription}>
                {transaction.description}
              </ThemedText>
              <View style={styles.transactionMeta}>
                <ThemedText style={styles.transactionCategory}>
                  {getCategoryLabel(transaction.category)}
                </ThemedText>
                {transaction.merchantName && (
                  <>
                    <ThemedText style={styles.metaSeparator}>•</ThemedText>
                    <ThemedText style={styles.transactionMerchant}>
                      {transaction.merchantName}
                    </ThemedText>
                  </>
                )}
              </View>
              <ThemedText style={styles.transactionDate}>
                {formatDateRelative(transaction.date)}
              </ThemedText>
            </View>

            <View style={styles.transactionAmount}>
              <ThemedText style={[
                styles.amountText,
                transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
              ]}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No transactions found</ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  metaSeparator: {
    marginHorizontal: 6,
    color: '#cbd5e1',
  },
  transactionMerchant: {
    fontSize: 14,
    color: '#64748b',
  },
  transactionDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  transactionAmount: {
    justifyContent: 'center',
    marginLeft: 12,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
  },
  incomeAmount: {
    color: '#10b981',
  },
  expenseAmount: {
    color: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
});
