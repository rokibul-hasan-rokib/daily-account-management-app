import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/constants/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type CategoryType = 'income' | 'expense';

const categoryIcons = [
  { label: 'Shopping Cart', value: 'shopping-cart' },
  { label: 'Car', value: 'directions-car' },
  { label: 'Bolt', value: 'bolt' },
  { label: 'Wallet', value: 'account-balance-wallet' },
  { label: 'Work', value: 'work' },
  { label: 'Home', value: 'home' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Local Offer', value: 'local-offer' },
  { label: 'School', value: 'school' },
  { label: 'Medical', value: 'medical-services' },
  { label: 'Entertainment', value: 'movie' },
  { label: 'Sports', value: 'sports' },
];

const categoryColors = [
  { label: 'Green', value: Colors.success.main },
  { label: 'Blue', value: Colors.info.main },
  { label: 'Orange', value: Colors.warning.main },
  { label: 'Purple', value: Colors.primary[500] },
  { label: 'Red', value: Colors.error.main },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Indigo', value: '#6366f1' },
];

export default function AddCategoryScreen() {
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [icon, setIcon] = useState('local-offer');
  const [color, setColor] = useState(Colors.primary[500]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a category name');
      return;
    }
    // In real app, this would save to backend/state
    console.log({ name, type, icon, color });
    router.back();
  };

  const isValid = name.trim().length > 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <ThemedText type="title" style={styles.headerTitle}>New Category</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {type === 'income' ? 'Add income category' : 'Add expense category'}
            </ThemedText>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Type Toggle */}
        <View style={styles.typeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              styles.typeButtonLeft,
              type === 'income' && styles.typeButtonActive,
              type === 'income' && styles.typeButtonActiveIncome
            ]}
            onPress={() => setType('income')}
            activeOpacity={0.8}
          >
            <View style={[
              styles.typeIconContainer,
              type === 'income' && styles.typeIconContainerActive
            ]}>
              <MaterialIcons 
                name="trending-up" 
                size={24} 
                color={type === 'income' ? Colors.primary[600] : Colors.primary[400]} 
              />
            </View>
            <Text style={[
              styles.typeButtonText,
              type === 'income' && styles.typeButtonTextActive
            ]}>
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              styles.typeButtonRight,
              type === 'expense' && styles.typeButtonActive,
              type === 'expense' && styles.typeButtonActiveExpense
            ]}
            onPress={() => setType('expense')}
            activeOpacity={0.8}
          >
            <View style={[
              styles.typeIconContainer,
              type === 'expense' && styles.typeIconContainerActive
            ]}>
              <MaterialIcons 
                name="trending-down" 
                size={24} 
                color={type === 'expense' ? Colors.primary[600] : Colors.primary[400]} 
              />
            </View>
            <Text style={[
              styles.typeButtonText,
              type === 'expense' && styles.typeButtonTextActive
            ]}>
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Category Name */}
          <Input
            label="Category Name *"
            placeholder="e.g., Entertainment, Food, Travel"
            value={name}
            onChangeText={setName}
            leftIcon={<MaterialIcons name="label" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          {/* Icon Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Icon</Text>
            <View style={styles.iconGrid}>
              {categoryIcons.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.iconButton,
                    icon === item.value && styles.iconButtonActive
                  ]}
                  onPress={() => setIcon(item.value)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons 
                    name={item.value as any} 
                    size={24} 
                    color={icon === item.value ? Colors.text.inverse : Colors.text.secondary} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {categoryColors.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.colorButton,
                    { backgroundColor: item.value },
                    color === item.value && styles.colorButtonActive
                  ]}
                  onPress={() => setColor(item.value)}
                  activeOpacity={0.7}
                >
                  {color === item.value && (
                    <MaterialIcons name="check" size={20} color={Colors.text.inverse} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <Card variant="elevated" style={styles.previewCard}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.previewContent}>
              <View style={[styles.previewIcon, { backgroundColor: `${color}20` }]}>
                <MaterialIcons name={icon as any} size={24} color={color} />
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{name || 'Category Name'}</Text>
                <Text style={styles.previewType}>
                  {type === 'income' ? 'Income' : 'Expense'} Category
                </Text>
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelButton}
            />
            <Button
              title="Save Category"
              variant="primary"
              onPress={handleSave}
              disabled={!isValid}
              style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
            />
          </View>

          {/* Helper Text */}
          <Text style={styles.helperText}>
            * Required fields
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.primary[100],
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  typeToggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
    borderWidth: 2,
    borderColor: Colors.primary[200],
    ...Shadows.sm,
  },
  typeButtonLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  typeButtonRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  typeButtonActive: {
    borderWidth: 2,
    ...Shadows.md,
  },
  typeButtonActiveIncome: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[100],
  },
  typeButtonActiveExpense: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[100],
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  typeIconContainerActive: {
    backgroundColor: Colors.primary[300],
  },
  typeButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
  typeButtonTextActive: {
    color: Colors.primary[700],
  },
  form: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
    marginBottom: Spacing.sm,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.primary[50],
    borderWidth: 2,
    borderColor: Colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[600],
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  colorButtonActive: {
    borderColor: Colors.primary[700],
    ...Shadows.md,
  },
  previewCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primary[50],
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  previewLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  previewType: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary[500],
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
