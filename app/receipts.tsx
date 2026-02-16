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
import { useReceipts } from '@/contexts/receipts-context';
import { Receipt } from '@/services/api/types';

export default function ReceiptsScreen() {
  const { receipts, isLoading, refreshReceipts, deleteReceipt } = useReceipts();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshReceipts();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshReceipts();
    setRefreshing(false);
  }, []);

  const filteredReceipts = useMemo(() => {
    let filtered = [...receipts];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.vendor_name?.toLowerCase().includes(query) ||
          r.total_amount?.includes(query)
      );
    }
    return filtered.sort(
      (a, b) => new Date(b.receipt_date || b.created_at || '').getTime() - new Date(a.receipt_date || a.created_at || '').getTime()
    );
  }, [receipts, searchQuery]);

  const handleDelete = (receipt: Receipt) => {
    Alert.alert(
      'Delete Receipt',
      `Are you sure you want to delete receipt from ${receipt.vendor_name || 'Unknown'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReceipt(receipt.id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete receipt');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (receipt: Receipt) => {
    if (receipt.is_extracted) return Colors.success.main;
    return Colors.warning.main;
  };

  const getStatusText = (receipt: Receipt) => {
    if (receipt.is_extracted) return 'Extracted';
    return 'Pending';
  };

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
              <ThemedText type="title" style={styles.headerTitle}>Receipts</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {filteredReceipts.length} receipt{filteredReceipts.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/scan-receipt' as any)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="camera-alt" size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search receipts..."
            leftIcon={<MaterialIcons name="search" size={20} color={Colors.text.secondary} />}
          />
        </View>

        {/* Receipt List */}
        {isLoading && receipts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <ThemedText style={styles.loadingText}>Loading receipts...</ThemedText>
          </View>
        ) : filteredReceipts.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <MaterialIcons name="receipt-long" size={48} color={Colors.gray[300]} />
            <ThemedText style={styles.emptyTitle}>No Receipts</ThemedText>
            <ThemedText style={styles.emptyText}>
              Scan receipts to automatically extract and track your expenses
            </ThemedText>
            <Button
              title="Scan Receipt"
              variant="primary"
              onPress={() => router.push('/scan-receipt' as any)}
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          filteredReceipts.map((receipt) => (
            <Card key={receipt.id} variant="elevated" style={styles.receiptCard}>
              <TouchableOpacity
                style={styles.receiptContent}
                onPress={() => router.push({ pathname: '/receipts/[id]', params: { id: receipt.id.toString() } } as any)}
                activeOpacity={0.7}
              >
                <View style={styles.receiptRow}>
                  {/* Thumbnail */}
                  <View style={styles.thumbnailContainer}>
                    {receipt.image ? (
                      <Image source={{ uri: receipt.image }} style={styles.thumbnail} />
                    ) : (
                      <View style={styles.thumbnailPlaceholder}>
                        <MaterialIcons name="receipt" size={24} color={Colors.gray[400]} />
                      </View>
                    )}
                  </View>

                  {/* Details */}
                  <View style={styles.receiptDetails}>
                    <View style={styles.receiptHeader}>
                      <ThemedText style={styles.vendorName} numberOfLines={1}>
                        {receipt.vendor_name || 'Unknown Vendor'}
                      </ThemedText>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(receipt) + '20' }]}>
                        <ThemedText style={[styles.statusText, { color: getStatusColor(receipt) }]}>
                          {getStatusText(receipt)}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.receiptMeta}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="calendar-today" size={12} color={Colors.text.secondary} />
                        <ThemedText style={styles.metaText}>
                          {receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString() : 'No date'}
                        </ThemedText>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="shopping-bag" size={12} color={Colors.text.secondary} />
                        <ThemedText style={styles.metaText}>
                          {receipt.items?.length || 0} items
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedText style={styles.receiptAmount}>
                      £{parseFloat(receipt.total_amount || '0').toFixed(2)}
                    </ThemedText>
                  </View>

                  {/* Actions */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(receipt)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="delete-outline" size={20} color={Colors.error.main} />
                  </TouchableOpacity>
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
    marginBottom: Spacing.md,
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
  receiptCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  receiptContent: {
    padding: Spacing.md,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  thumbnailContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  receiptDetails: {
    flex: 1,
  },
  receiptHeader: {
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
  receiptMeta: {
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
  receiptAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
