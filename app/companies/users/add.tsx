/**
 * Add Company User Screen
 * Allows adding a user to the company
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Colors, Spacing, Typography } from '@/constants/design-system';
import { CompanyUsersService } from '@/services/api';
import { CompanyUserRequest } from '@/services/api/types';
import { useCompanyUsers } from '@/contexts/company-users-context';
import { useCompany } from '@/contexts/company-context';
import { useRoles } from '@/contexts/roles-context';

export default function AddCompanyUserScreen() {
  const router = useRouter();
  const { currentCompany } = useCompany();
  const { loadCompanyUsers } = useCompanyUsers();
  const { roles } = useRoles();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CompanyUserRequest>({
    company: currentCompany?.id || 0,
    user_id: 0,
    role_id: undefined,
    is_admin: false,
    is_owner: false,
  });

  const handleSave = async () => {
    if (!formData.user_id || formData.user_id === 0) {
      Alert.alert('Validation Error', 'Please enter a user ID');
      return;
    }

    if (!formData.company || formData.company === 0) {
      Alert.alert('Validation Error', 'Company not selected');
      return;
    }

    try {
      setIsSaving(true);
      await CompanyUsersService.createCompanyUser(formData);
      await loadCompanyUsers();
      Alert.alert('Success', 'User added to company successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error adding company user:', error);
      Alert.alert('Error', error.message || 'Failed to add user to company');
    } finally {
      setIsSaving(false);
    }
  };

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
            <ThemedText type="title" style={styles.headerTitle}>Add User</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Add a user to {currentCompany?.name}</ThemedText>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="User ID *"
            placeholder="Enter user ID"
            value={formData.user_id?.toString() || ''}
            onChangeText={(text) => setFormData({ ...formData, user_id: parseInt(text) || 0 })}
            keyboardType="numeric"
            leftIcon={<MaterialIcons name="person" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          {roles.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>Role</ThemedText>
              <View style={styles.roleList}>
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      styles.roleButton,
                      formData.role_id === role.id && styles.roleButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role_id: role.id })}
                  >
                    <ThemedText
                      style={[
                        styles.roleButtonText,
                        formData.role_id === role.id && styles.roleButtonTextActive,
                      ]}
                    >
                      {role.name}
                    </ThemedText>
                    {role.description && (
                      <ThemedText style={styles.roleDescription}>{role.description}</ThemedText>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({ ...formData, is_admin: !formData.is_admin })}
            >
              <MaterialIcons
                name={formData.is_admin ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={formData.is_admin ? Colors.primary[500] : Colors.gray[400]}
              />
              <ThemedText style={styles.checkboxLabel}>Admin</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({ ...formData, is_owner: !formData.is_owner })}
            >
              <MaterialIcons
                name={formData.is_owner ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={formData.is_owner ? Colors.primary[500] : Colors.gray[400]}
              />
              <ThemedText style={styles.checkboxLabel}>Owner</ThemedText>
            </TouchableOpacity>
          </View>

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
              title={isSaving ? 'Adding...' : 'Add User'}
              variant="primary"
              onPress={handleSave}
              disabled={!formData.user_id || formData.user_id === 0 || isSaving}
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
  roleList: {
    gap: Spacing.sm,
  },
  roleButton: {
    padding: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    borderWidth: 2,
    borderColor: Colors.gray[300],
  },
  roleButtonActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  roleButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  roleButtonTextActive: {
    color: Colors.primary[600],
  },
  roleDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  checkboxContainer: {
    marginBottom: Spacing.md,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkboxLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
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
