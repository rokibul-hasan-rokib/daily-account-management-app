/**
 * Edit Company Screen
 * Allows editing company details
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Colors, Spacing, Typography } from '@/constants/design-system';
import { CompaniesService } from '@/services/api';
import { Company, CompanyRequest } from '@/services/api/types';
import { useCompany } from '@/contexts/company-context';

const SUBSCRIPTION_PLANS = [
  { label: 'Basic', value: 'basic' },
  { label: 'Professional', value: 'professional' },
  { label: 'Enterprise', value: 'enterprise' },
];

export default function EditCompanyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { refreshCurrentCompany } = useCompany();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CompanyRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    subscription_plan: 'basic',
    max_users: 10,
    max_storage_mb: 1000,
  });

  useEffect(() => {
    loadCompany();
  }, [id]);

  const loadCompany = async () => {
    try {
      setIsLoading(true);
      const companyId = parseInt(id || '0', 10);
      const company = await CompaniesService.getCompanyDetails(companyId);
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        subscription_plan: company.subscription_plan || 'basic',
        max_users: company.max_users || 10,
        max_storage_mb: company.max_storage_mb || 1000,
      });
    } catch (error: any) {
      console.error('Error loading company:', error);
      Alert.alert('Error', error.message || 'Failed to load company details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      Alert.alert('Validation Error', 'Please enter a company name');
      return;
    }

    try {
      setIsSaving(true);
      const companyId = parseInt(id || '0', 10);
      await CompaniesService.updateCompany(companyId, formData);
      await refreshCurrentCompany();
      Alert.alert('Success', 'Company updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating company:', error);
      Alert.alert('Error', error.message || 'Failed to update company');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <ThemedText style={styles.loadingText}>Loading company...</ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <ThemedText type="title" style={styles.headerTitle}>Edit Company</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Update company information</ThemedText>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Company Name *"
            placeholder="Enter company name"
            value={formData.name || ''}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            leftIcon={<MaterialIcons name="business" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Email"
            placeholder="contact@company.com"
            value={formData.email || ''}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<MaterialIcons name="email" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Phone"
            placeholder="+1234567890"
            value={formData.phone || ''}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
            leftIcon={<MaterialIcons name="phone" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Address"
            placeholder="123 Main St, City, State"
            value={formData.address || ''}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            multiline
            numberOfLines={2}
            leftIcon={<MaterialIcons name="location-on" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Subscription Plan</ThemedText>
            <View style={styles.planGrid}>
              {SUBSCRIPTION_PLANS.map((plan) => (
                <TouchableOpacity
                  key={plan.value}
                  style={[
                    styles.planButton,
                    formData.subscription_plan === plan.value && styles.planButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, subscription_plan: plan.value as any })}
                >
                  <ThemedText
                    style={[
                      styles.planButtonText,
                      formData.subscription_plan === plan.value && styles.planButtonTextActive,
                    ]}
                  >
                    {plan.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Max Users"
            placeholder="10"
            value={formData.max_users?.toString() || ''}
            onChangeText={(text) => setFormData({ ...formData, max_users: parseInt(text) || 10 })}
            keyboardType="numeric"
            leftIcon={<MaterialIcons name="people" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Max Storage (MB)"
            placeholder="1000"
            value={formData.max_storage_mb?.toString() || ''}
            onChangeText={(text) => setFormData({ ...formData, max_storage_mb: parseInt(text) || 1000 })}
            keyboardType="numeric"
            leftIcon={<MaterialIcons name="storage" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelButton}
              disabled={isSaving}
            />
            <Button
              title={isSaving ? 'Saving...' : 'Save Changes'}
              variant="primary"
              onPress={handleSave}
              disabled={!formData.name?.trim() || isSaving}
              style={styles.saveButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
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
    fontWeight: '700',
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
    fontWeight: '600',
    color: Colors.primary[700],
    marginBottom: Spacing.sm,
  },
  planGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  planButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: 'center',
  },
  planButtonActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  planButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  planButtonTextActive: {
    color: Colors.primary[600],
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
});
