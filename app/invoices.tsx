import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing } from '@/constants/design-system';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator, RefreshControl, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useInvoices } from '@/contexts/invoices-context';
import { Invoice } from '@/services/api/types';

type StatusFilter = 'all' | 'extracted' | 'pending';

export default function InvoicesScreen() {
  const { invoices, isLoading, refreshInvoices } = useInvoices();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshInvoices();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshInvoices();
    setRefreshing(false);
  }, []);

  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    // Filter by status
    if (filter === 'extracted') {
      filtered = filtered.filter(i => i.is_extracted);
    } else if (filter === 'pending') {
      filtered = filtered.filter(i => !i.is_extracted);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        i =>
          i.vendor_name?.toLowerCase().includes(query) ||
          i.total_amount?.includes(query)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.invoice_date || b.created_at || '').getTime() - new Date(a.invoice_date || a.created_at || '').getTime()
    );
  }, [invoices, searchQuery, filter]);

  const getStatusColor = (invoice: Invoice) => {
    if (invoice.is_extracted) return Colors.success.main;
    return Colors.warning.main;
  };

  const getStatusText = (invoice: Invoice) => {
    if (invoice.is_extracted) return 'Extracted';
    return 'Pending';
  };

  const filters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Extracted', value: 'extracted' },
    { label: 'Pending', value: 'pending' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MenuButton />
            <View style={styles.headerTextContainer}>
              <ThemedText type="title" style={styles.headerTitle}>Invoices</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/invoices/add' as any)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search invoices..."
            leftIcon={<MaterialIcons name="search" size={20} color={Colors.text.secondary} />}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContent}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterButton, filter === f.value && styles.filterButtonActive]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.filterButtonText, filter === f.value && styles.filterButtonTextActive]}>
                {f.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Invoice List */}
        {isLoading && invoices.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <ThemedText style={styles.loadingText}>Loading invoices...</ThemedText>
          </View>
        ) : filteredInvoices.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <MaterialIcons name="description" size={48} color={Colors.gray[300]} />
            <ThemedText style={styles.emptyTitle}>No Invoices</ThemedText>
            <ThemedText style={styles.emptyText}>
              Upload invoices to automatically extract and track your expenses
            </ThemedText>
            <Button
              title="Upload Invoice"
              variant="primary"
              onPress={() => router.push('/invoices/add' as any)}
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} variant="elevated" style={styles.invoiceCard}>
              <TouchableOpacity
                style={styles.invoiceContent}
                onPress={() => router.push({ pathname: '/invoices/[id]', params: { id: invoice.id.toString() } } as any)}
                activeOpacity={0.7}
              >
                <View style={styles.invoiceRow}>
                  {/* Icon */}
                  <View style={styles.iconContainer}>
                    {invoice.image ? (
                      <Image source={{ uri: invoice.image }} style={styles.thumbnail} />
                    ) : (
                      <View style={styles.iconPlaceholder}>
                        <MaterialIcons name="description" size={24} color={Colors.primary[500]} />
                      </View>
                    )}
                  </View>

                  {/* Details */}
                  <View style={styles.invoiceDetails}>
                    <View style={styles.invoiceHeader}>
                      <ThemedText style={styles.vendorName} numberOfLines={1}>
                        {invoice.vendor_name || 'Unknown Vendor'}
                      </ThemedText>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice) + '20' }]}>
                        <ThemedText style={[styles.statusText, { color: getStatusColor(invoice) }]}>
                          {getStatusText(invoice)}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.invoiceMeta}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="calendar-today" size={12} color={Colors.text.secondary} />
                        <ThemedText style={styles.metaText}>
                          {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'No date'}
                        </ThemedText>
                      </View>
                      {invoice.items && (
                        <View style={styles.metaItem}>
                          <MaterialIcons name="list" size={12} color={Colors.text.secondary} />
                          <ThemedText style={styles.metaText}>
                            {invoice.items.length} items
                          </ThemedText>
                        </View>
                      )}
                    </View>

                    <ThemedText style={styles.invoiceAmount}>
                      £{parseFloat(invoice.total_amount || '0').toFixed(2)}
                    </ThemedText>
                  </View>

                  <MaterialIcons name="chevron-right" size={24} color={Colors.gray[400]} />
                </View>
              </TouchableOpacity>
            </Card>
          ))
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
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
  headerTextContainer: {
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterContent: {
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    marginRight: Spacing.sm,
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
    paddingTop: Spacing['3xl'],
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    minWidth: 160,
  },
  invoiceCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  invoiceContent: {
    padding: Spacing.md,
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  iconPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  invoiceDetails: {
    flex: 1,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  invoiceMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  invoiceAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
});
