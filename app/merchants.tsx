import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, ActivityIndicator, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useMerchants } from '@/contexts/merchants-context';
import { Merchant } from '@/services/api/types';

export default function MerchantsScreen() {
  const { 
    merchants, 
    isLoading, 
    deleteMerchant: deleteMerchantFromContext,
  } = useMerchants();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMerchants = useMemo(() => {
    return merchants.filter(merchant =>
      merchant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [merchants, searchQuery]);

  const handleDeleteMerchant = async (id: number, name: string) => {
    Alert.alert(
      'Delete Merchant',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMerchantFromContext(id);
              Alert.alert('Success', 'Merchant deleted successfully');
            } catch (error: any) {
              console.error('Error deleting merchant:', error);
              Alert.alert('Error', error.message || 'Failed to delete merchant');
            }
          },
        },
      ]
    );
  };

  const handleEditMerchant = (merchant: Merchant) => {
    router.push({
      pathname: '/merchants/add',
      params: { 
        id: merchant.id.toString(),
        name: merchant.name,
        default_category: merchant.default_category?.toString() || '',
      },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Merchants</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Track spending by merchant
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/merchants/add')}
        >
          <MaterialIcons name="add" size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search merchants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<MaterialIcons name="search" size={20} color={Colors.text.secondary} />}
        />
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <ThemedText style={styles.loadingText}>Loading merchants...</ThemedText>
        </View>
      ) : (
        <>
          {/* Merchants List */}
          <View style={styles.merchantsList}>
            {filteredMerchants.length === 0 ? (
              <Card variant="elevated" style={styles.emptyCard}>
                <MaterialIcons name="store" size={48} color={Colors.text.tertiary} />
                <ThemedText style={styles.emptyText}>
                  No merchants found. Create your first merchant!
                </ThemedText>
              </Card>
            ) : (
              filteredMerchants.map((merchant) => (
                <Card key={merchant.id} variant="elevated" style={styles.merchantCard}>
                  <TouchableOpacity
                    style={styles.merchantContent}
                    onPress={() => handleEditMerchant(merchant)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.merchantIcon}>
                      <MaterialIcons name="store" size={24} color={Colors.primary[600]} />
                    </View>
                    <View style={styles.merchantInfo}>
                      <ThemedText style={styles.merchantName}>{merchant.name}</ThemedText>
                      {merchant.default_category_name && (
                        <View style={styles.merchantMeta}>
                          <Text style={styles.merchantCategory}>{merchant.default_category_name}</Text>
                        </View>
                      )}
                      {merchant.created_at && (
                        <Text style={styles.lastTransaction}>
                          Created: {new Date(merchant.created_at).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.merchantActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditMerchant(merchant)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="edit" size={20} color={Colors.primary[600]} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteMerchant(merchant.id, merchant.name)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="delete" size={20} color={Colors.error.main} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
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
    fontSize: Typography.fontSize.base,
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
  loadingContainer: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
  },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: 'center',
    color: Colors.text.secondary,
  },
  merchantsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  merchantCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  merchantContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  merchantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  merchantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  merchantCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  metaSeparator: {
    marginHorizontal: Spacing.xs,
    color: Colors.gray[300],
  },
  merchantCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  lastTransaction: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  merchantActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
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
});
