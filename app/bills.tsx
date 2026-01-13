import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuButton } from '@/components/menu-button';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLiabilities } from '@/contexts/liabilities-context';
import { router, useFocusEffect } from 'expo-router';
import { Liability } from '@/services/api/types';

export default function BillsScreen() {
  const { liabilities, isLoading, markAsPaid, deleteLiability, refreshLiabilities } = useLiabilities();
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const params = filter !== 'all' ? { status: filter } : undefined;
      refreshLiabilities(params);
    }, [filter, refreshLiabilities])
  );

  const filteredBills = useMemo(() => {
    return liabilities
      .filter(b => filter === 'all' || b.status === filter)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [liabilities, filter]);

  const totalUnpaid = useMemo(() => {
    return liabilities
      .filter(b => b.status === 'unpaid' || b.status === 'overdue')
      .reduce((sum, b) => sum + parseFloat(b.amount), 0);
  }, [liabilities]);

  const handleMarkAsPaid = async (id: number) => {
    Alert.alert(
      'Mark as Paid',
      'Are you sure you want to mark this bill as paid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Paid',
          onPress: async () => {
            try {
              await markAsPaid(id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to mark bill as paid.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLiability(id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete bill.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <MenuButton />
            <ThemedText type="title" style={styles.headerTitle}>Bills & Liabilities</ThemedText>
          </View>
          <View style={styles.headerSubtitleContainer}>
            <MaterialIcons name="warning" size={16} color={Colors.error.main} />
            <ThemedText style={styles.headerSubtitle}>
              Total unpaid: {formatCurrency(totalUnpaid)}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/bills/add')}
        >
          <MaterialIcons name="add" size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'unpaid', 'overdue', 'paid'] as const).map((f) => (
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
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bills List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <ThemedText style={styles.loadingText}>Loading bills...</ThemedText>
          </View>
        ) : (
          <>
            {filteredBills.map((bill) => (
              <Card key={bill.id} variant="elevated" style={styles.billCard}>
                <View style={styles.billContent}>
                  <View style={styles.billHeader}>
                    <TouchableOpacity 
                      style={styles.billTitleContainer}
                      onPress={() => router.push(`/bills/add?id=${bill.id}`)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons 
                        name="receipt" 
                        size={20} 
                        color={bill.status === 'overdue' ? Colors.error.main : Colors.primary[600]} 
                      />
                      <ThemedText style={styles.billName}>{bill.name}</ThemedText>
                    </TouchableOpacity>
                    <View style={styles.billHeaderRight}>
                      <ThemedText style={styles.billAmount}>
                        {formatCurrency(parseFloat(bill.amount))}
                      </ThemedText>
                      <TouchableOpacity
                        onPress={() => handleDelete(bill.id)}
                        style={styles.deleteButton}
                      >
                        <MaterialIcons name="delete-outline" size={20} color={Colors.error.main} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.billMeta}>
                    <Badge
                      label={bill.status === 'overdue' ? 'OVERDUE' : 
                             bill.status === 'paid' ? 'PAID' : 'UNPAID'}
                      variant={bill.status === 'overdue' ? 'error' : 
                              bill.status === 'paid' ? 'success' : 'warning'}
                    />
                    <View style={styles.dueDateContainer}>
                      <MaterialIcons 
                        name="calendar-today" 
                        size={14} 
                        color={bill.status === 'overdue' ? Colors.error.main : Colors.text.secondary} 
                      />
                      <ThemedText style={[
                        styles.dueDate,
                        bill.status === 'overdue' && styles.dueDateOverdue
                      ]}>
                        Due: {formatDate(new Date(bill.due_date))}
                      </ThemedText>
                    </View>
                    {bill.category_name && (
                      <Badge
                        label={bill.category_name}
                        variant="default"
                        size="sm"
                      />
                    )}
                  </View>

                  {bill.description && (
                    <View style={styles.notesContainer}>
                      <MaterialIcons name="notes" size={16} color={Colors.text.secondary} />
                      <ThemedText style={styles.billNotes}>{bill.description}</ThemedText>
                    </View>
                  )}

                  {bill.is_recurring && (
                    <View style={styles.recurringContainer}>
                      <MaterialIcons name="repeat" size={16} color={Colors.primary[600]} />
                      <ThemedText style={styles.recurringText}>
                        Recurring: {bill.recurring_frequency || 'monthly'}
                      </ThemedText>
                    </View>
                  )}

                  {(bill.status === 'unpaid' || bill.status === 'pending') && (
                    <TouchableOpacity 
                      style={styles.markPaidButton}
                      onPress={() => handleMarkAsPaid(bill.id)}
                    >
                      <MaterialIcons name="check-circle" size={18} color={Colors.text.inverse} />
                      <ThemedText style={styles.markPaidText}>Mark as Paid</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))}

            {filteredBills.length === 0 && !isLoading && (
              <View style={styles.emptyState}>
                <MaterialIcons name="receipt-long" size={64} color={Colors.text.tertiary} />
                <ThemedText style={styles.emptyTitle}>No bills found</ThemedText>
                <ThemedText style={styles.emptyText}>
                  {filter !== 'all' ? 'Try adjusting your filter' : 'Add your first bill to get started'}
                </ThemedText>
              </View>
            )}
          </>
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
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
    color: Colors.text.primary,
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error.main,
    fontWeight: Typography.fontWeight.semibold,
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
  filterContainer: {
    marginBottom: Spacing.md,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
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
  billCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  billContent: {
    gap: Spacing.md,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  billTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  billHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  billName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  billAmount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.text.primary,
  },
  deleteButton: {
    padding: Spacing.xs,
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
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary[50],
    padding: Spacing.sm,
    borderRadius: 8,
  },
  recurringText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[700],
    fontWeight: Typography.fontWeight.semibold,
  },
  billMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dueDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  dueDateOverdue: {
    color: Colors.error.main,
    fontWeight: Typography.fontWeight.semibold,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.gray[100],
    padding: Spacing.md,
    borderRadius: 8,
  },
  billNotes: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  markPaidButton: {
    backgroundColor: Colors.success.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  markPaidText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
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
  },
});
