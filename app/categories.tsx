import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  transactionCount: number;
}

const dummyCategories: Category[] = [
  { id: '1', name: 'Groceries', type: 'expense', color: Colors.success.main, icon: 'shopping-cart', transactionCount: 45 },
  { id: '2', name: 'Transport', type: 'expense', color: Colors.info.main, icon: 'directions-car', transactionCount: 32 },
  { id: '3', name: 'Utilities', type: 'expense', color: Colors.warning.main, icon: 'bolt', transactionCount: 12 },
  { id: '4', name: 'Salary', type: 'income', color: Colors.success.main, icon: 'account-balance-wallet', transactionCount: 8 },
  { id: '5', name: 'Freelance', type: 'income', color: Colors.primary[500], icon: 'work', transactionCount: 15 },
  { id: '6', name: 'Rent', type: 'expense', color: Colors.error.main, icon: 'home', transactionCount: 6 },
];

export default function CategoriesScreen() {
  const [categories] = useState<Category[]>(dummyCategories);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');

  const filteredCategories = categories.filter(cat => 
    filter === 'all' || cat.type === filter
  );

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      // In real app, add to backend
      console.log('Adding category:', { name: newCategoryName, type: newCategoryType });
      setNewCategoryName('');
      setIsAdding(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          onPress={() => setIsAdding(!isAdding)}
        >
          <MaterialIcons name={isAdding ? "close" : "add"} size={24} color={Colors.text.inverse} />
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

      {/* Add Category Form */}
      {isAdding && (
        <Card variant="elevated" style={styles.addFormCard}>
          <ThemedText type="subtitle" style={styles.formTitle}>Add New Category</ThemedText>
          <Input
            label="Category Name"
            placeholder="e.g., Entertainment, Food"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeButton, newCategoryType === 'income' && styles.typeButtonActive]}
              onPress={() => setNewCategoryType('income')}
            >
              <Text style={[styles.typeButtonText, newCategoryType === 'income' && styles.typeButtonTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, newCategoryType === 'expense' && styles.typeButtonActive]}
              onPress={() => setNewCategoryType('expense')}
            >
              <Text style={[styles.typeButtonText, newCategoryType === 'expense' && styles.typeButtonTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>
          </View>
          <Button
            title="Add Category"
            variant="primary"
            onPress={handleAddCategory}
            style={styles.addFormButton}
          />
        </Card>
      )}

      {/* Categories List */}
      <View style={styles.categoriesList}>
        {filteredCategories.map((category) => (
          <Card key={category.id} variant="elevated" style={styles.categoryCard}>
            <View style={styles.categoryContent}>
              <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                <MaterialIcons name={category.icon as any} size={24} color={category.color} />
              </View>
              <View style={styles.categoryInfo}>
                <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                <ThemedText style={styles.categoryMeta}>
                  {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
                </ThemedText>
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
            </View>
          </Card>
        ))}
      </View>
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
  addFormCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  formTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  typeButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  typeButtonTextActive: {
    color: Colors.text.inverse,
  },
  addFormButton: {
    width: '100%',
  },
  categoriesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  categoryCard: {
    padding: Spacing.md,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  categoryMeta: {
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
});
