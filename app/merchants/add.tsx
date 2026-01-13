import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/constants/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMerchants } from '@/contexts/merchants-context';
import { useCategories } from '@/contexts/categories-context';

export default function AddMerchantScreen() {
  const params = useLocalSearchParams();
  const isEditMode = !!params.id;
  const { createMerchant, updateMerchant } = useMerchants();
  const { categories } = useCategories();
  
  const [name, setName] = useState(params.name?.toString() || '');
  const [defaultCategory, setDefaultCategory] = useState<number | undefined>(
    params.default_category ? parseInt(params.default_category.toString()) : undefined
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a merchant name');
      return;
    }

    try {
      setLoading(true);
      const merchantData = {
        name: name.trim(),
        default_category: defaultCategory,
      };

      if (isEditMode && params.id) {
        await updateMerchant(parseInt(params.id.toString()), merchantData);
        // Redirect to merchants list after successful update
        router.replace('/merchants');
      } else {
        await createMerchant(merchantData);
        // Redirect to merchants list after successful creation
        router.replace('/merchants');
      }
    } catch (error: any) {
      console.error('Error saving merchant:', error);
      Alert.alert('Error', error.message || 'Failed to save merchant');
    } finally {
      setLoading(false);
    }
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
            <ThemedText type="title" style={styles.headerTitle}>
              {isEditMode ? 'Edit Merchant' : 'New Merchant'}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {isEditMode ? 'Update merchant details' : 'Add a new merchant or vendor'}
            </ThemedText>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Merchant Name */}
          <Input
            label="Merchant Name *"
            placeholder="e.g., Tesco, Amazon, Uber"
            value={name}
            onChangeText={setName}
            leftIcon={<MaterialIcons name="store" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          {/* Default Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Default Category (Optional)</Text>
            <View style={styles.categoryGrid}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  !defaultCategory && styles.categoryChipActive
                ]}
                onPress={() => setDefaultCategory(undefined)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryChipText,
                  !defaultCategory && styles.categoryChipTextActive
                ]}>
                  None
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    defaultCategory === cat.id && styles.categoryChipActive
                  ]}
                  onPress={() => setDefaultCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryChipText,
                    defaultCategory === cat.id && styles.categoryChipTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview Card */}
          {name && (
            <Card variant="elevated" style={styles.previewCard}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewContent}>
                <View style={styles.previewIcon}>
                  <MaterialIcons name="store" size={24} color={Colors.primary[600]} />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{name}</Text>
                  {defaultCategory && (
                    <Text style={styles.previewCategory}>
                      {categories.find(c => c.id === defaultCategory)?.name || 'Category'}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelButton}
              disabled={loading}
            />
            <Button
              title={loading ? 'Saving...' : isEditMode ? 'Update Merchant' : 'Save Merchant'}
              variant="primary"
              onPress={handleSave}
              disabled={!isValid || loading}
              style={[styles.saveButton, (!isValid || loading) && styles.saveButtonDisabled]}
            />
          </View>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary[500]} />
            </View>
          )}

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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
  },
  categoryChipActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[600],
  },
  categoryChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
  categoryChipTextActive: {
    color: Colors.text.inverse,
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
    backgroundColor: Colors.primary[100],
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
  previewCategory: {
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
