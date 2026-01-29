import { MenuButton } from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { useCategories } from '@/contexts/categories-context';
import { Category } from '@/services/api/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CategoriesScreen() {
  const { 
    categories, 
    isLoading, 
    deleteCategory: deleteCategoryFromContext,
    refreshCategories 
  } = useCategories();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useFocusEffect(
    useCallback(() => {
      refreshCategories();
    }, [refreshCategories])
  );

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      filter === 'all' || cat.type === filter
    );
  }, [categories, filter]);

  const handleDeleteCategory = async (id: number, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategoryFromContext(id);
              Alert.alert('Success', 'Category deleted successfully');
            } catch (error: any) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', error.message || 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const handleEditCategory = (category: Category) => {
    router.push({
      pathname: '/categories/add',
      params: { 
        id: category.id.toString(),
        name: category.name,
        type: category.type,
        icon: category.icon || '',
        color: category.color || Colors.primary[500],
        description: category.description || '',
      },
    });
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Categories</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Manage your transaction categories
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/categories/add')}
        >
          <MaterialIcons name="add" size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
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

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <ThemedText style={styles.loadingText}>Loading categories...</ThemedText>
        </View>
      ) : (
        <>
          {/* Categories List */}
          <View style={styles.categoriesList}>
            {filteredCategories.length === 0 ? (
              <Card variant="elevated" style={styles.emptyCard}>
                <MaterialIcons name="category" size={48} color={Colors.text.tertiary} />
                <ThemedText style={styles.emptyText}>
                  No categories found. Create your first category!
                </ThemedText>
              </Card>
            ) : (
              filteredCategories.map((category) => (
                <Card key={category.id} variant="elevated" style={styles.categoryCard}>
                  <TouchableOpacity
                    style={styles.categoryContent}
                    onPress={() => handleEditCategory(category)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.categoryIcon, 
                      { backgroundColor: category.color ? `${category.color}20` : Colors.primary[100] }
                    ]}>
                      {category.icon ? (
                        <Text style={styles.categoryIconEmoji}>{category.icon}</Text>
                      ) : (
                        <MaterialIcons 
                          name="category" 
                          size={24} 
                          color={category.color || Colors.primary[500]} 
                        />
                      )}
                    </View>
                    <View style={styles.categoryInfo}>
                      <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                      {category.description && (
                        <ThemedText style={styles.categoryDescription} numberOfLines={1}>
                          {category.description}
                        </ThemedText>
                      )}
                    </View>
                    <View style={styles.categoryBadge}>
                      <Text style={[
                        styles.categoryBadgeText,
                        category.type === 'income' && styles.categoryBadgeIncome,
                        category.type === 'expense' && styles.categoryBadgeExpense,
                      ]}>
                        {category.type === 'income' ? 'Income' : 'Expense'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.categoryActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditCategory(category)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="edit" size={20} color={Colors.primary[600]} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteCategory(category.id, category.name)}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
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
  categoriesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  categoryCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconEmoji: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  categoryDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
  },
  categoryBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  categoryBadgeIncome: {
    color: Colors.success.main,
  },
  categoryBadgeExpense: {
    color: Colors.error.main,
  },
  categoryActions: {
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
