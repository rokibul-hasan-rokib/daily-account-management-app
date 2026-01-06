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

const categoryOptions = [
  'Groceries',
  'Shopping',
  'Transport',
  'Food & Drink',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other',
];

export default function AddMerchantScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a merchant name');
      return;
    }
    // In real app, this would save to backend/state
    console.log({ name, category, address, phone, email });
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
            <ThemedText type="title" style={styles.headerTitle}>New Merchant</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Add a new merchant or vendor
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

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {categoryOptions.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Address */}
          <Input
            label="Address (Optional)"
            placeholder="Street address, city"
            value={address}
            onChangeText={setAddress}
            leftIcon={<MaterialIcons name="location-on" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
            multiline
            numberOfLines={2}
          />

          {/* Phone */}
          <Input
            label="Phone (Optional)"
            placeholder="Phone number"
            value={phone}
            onChangeText={setPhone}
            leftIcon={<MaterialIcons name="phone" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
            keyboardType="phone-pad"
          />

          {/* Email */}
          <Input
            label="Email (Optional)"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            leftIcon={<MaterialIcons name="email" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
            keyboardType="email-address"
            autoCapitalize="none"
          />

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
                  {category && (
                    <Text style={styles.previewCategory}>{category}</Text>
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
            />
            <Button
              title="Save Merchant"
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
});
