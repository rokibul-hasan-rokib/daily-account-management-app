import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { dummyLiabilities } from '@/data/dummy-data';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function BillsScreen() {
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');

  const filteredBills = dummyLiabilities
    .filter(b => filter === 'all' || b.status === filter)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const totalUnpaid = dummyLiabilities
    .filter(b => b.status === 'unpaid' || b.status === 'overdue')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <View>
          <ThemedText type="title" style={styles.headerTitle}>Bills & Liabilities</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Total unpaid: {formatCurrency(totalUnpaid)}
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <ThemedText style={styles.addButtonText}>+ Add</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {(['all', 'unpaid', 'overdue', 'paid'] as const).map((f) => (
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
      </ScrollView>

      {/* Bills List */}
      <ScrollView style={styles.list}>
        {filteredBills.map((bill) => (
          <TouchableOpacity key={bill.id} style={styles.billCard}>
            <View style={[
              styles.statusIndicator,
              bill.status === 'paid' && styles.statusPaid,
              bill.status === 'unpaid' && styles.statusUnpaid,
              bill.status === 'overdue' && styles.statusOverdue,
            ]} />

            <View style={styles.billContent}>
              <View style={styles.billHeader}>
                <ThemedText style={styles.billName}>{bill.name}</ThemedText>
                <ThemedText style={styles.billAmount}>
                  {formatCurrency(bill.amount)}
                </ThemedText>
              </View>

              <View style={styles.billMeta}>
                <View style={[
                  styles.statusBadge,
                  bill.status === 'overdue' && styles.statusBadgeOverdue,
                ]}>
                  <ThemedText style={[
                    styles.statusText,
                    bill.status === 'overdue' && styles.statusTextOverdue,
                  ]}>
                    {bill.status === 'overdue' ? 'OVERDUE' : 
                     bill.status === 'paid' ? 'PAID' : 'UNPAID'}
                  </ThemedText>
                </View>
                <ThemedText style={[
                  styles.dueDate,
                  bill.status === 'overdue' && styles.dueDateOverdue,
                ]}>
                  Due: {formatDate(bill.dueDate)}
                </ThemedText>
              </View>

              {bill.notes && (
                <ThemedText style={styles.billNotes}>{bill.notes}</ThemedText>
              )}

              {bill.status === 'unpaid' && (
                <TouchableOpacity style={styles.markPaidButton}>
                  <ThemedText style={styles.markPaidText}>Mark as Paid</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {filteredBills.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No bills found</ThemedText>
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
    alignItems: 'flex-start',
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
    color: '#ef4444',
    fontWeight: '600',
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
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
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
  billCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    width: 6,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  statusPaid: {
    backgroundColor: '#10b981',
  },
  statusUnpaid: {
    backgroundColor: '#f59e0b',
  },
  statusOverdue: {
    backgroundColor: '#ef4444',
  },
  billContent: {
    flex: 1,
    padding: 16,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  billName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  billAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  billMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  statusBadgeOverdue: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  statusTextOverdue: {
    color: '#ef4444',
  },
  dueDate: {
    fontSize: 14,
    color: '#64748b',
  },
  dueDateOverdue: {
    color: '#ef4444',
    fontWeight: '600',
  },
  billNotes: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  markPaidButton: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  markPaidText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
