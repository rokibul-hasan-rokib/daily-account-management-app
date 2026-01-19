/**
 * Edit Company User Screen
 * Allows editing a company user's role and permissions
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Colors, Spacing, Typography } from '@/constants/design-system';
import { CompanyUsersService } from '@/services/api';
import { CompanyUser } from '@/services/api/types';
import { useCompanyUsers } from '@/contexts/company-users-context';
import { useRoles } from '@/contexts/roles-context';

export default function EditCompanyUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { loadCompanyUsers } = useCompanyUsers();
  const { roles } = useRoles();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    loadCompanyUser();
  }, [id]);

  const loadCompanyUser = async () => {
    try {
      setIsLoading(true);
      // Get company user from context or API
      // For now, we'll need to fetch it
      const companyUserId = parseInt(id || '0', 10);
      // Note: You may need to add a getCompanyUserById method
      // For now, we'll use the list and find
      const response = await CompanyUsersService.getCompanyUsers();
      const user = response.results?.find((u) => u.id === companyUserId);
      
      if (user) {
        setCompanyUser(user);
        setSelectedRoleId(user.role?.id);
        setIsAdmin(user.is_admin);
        setIsOwner(user.is_owner);
      } else {
        Alert.alert('Error', 'User not found');
        router.back();
      }
    } catch (error: any) {
      console.error('Error loading company user:', error);
      Alert.alert('Error', error.message || 'Failed to load user details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!companyUser) return;

    try {
      setIsSaving(true);
      await CompanyUsersService.updateCompanyUser(companyUser.id, {
        role_id: selectedRoleId,
        is_admin: isAdmin,
        is_owner: isOwner,
      });
      await loadCompanyUsers();
      Alert.alert('Success', 'User updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating company user:', error);
      Alert.alert('Error', error.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <ThemedText style={styles.loadingText}>Loading user...</ThemedText>
      </View>
    );
  }

  if (!companyUser) {
    return null;
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
            <ThemedText type="title" style={styles.headerTitle}>Edit User</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {companyUser.user.first_name && companyUser.user.last_name
                ? `${companyUser.user.first_name} ${companyUser.user.last_name}`
                : companyUser.user.username}
            </ThemedText>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>User Information</ThemedText>
          <ThemedText style={styles.infoText}>Username: {companyUser.user.username}</ThemedText>
          <ThemedText style={styles.infoText}>Email: {companyUser.user.email}</ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {roles.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>Role</ThemedText>
              <View style={styles.roleList}>
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      styles.roleButton,
                      selectedRoleId === role.id && styles.roleButtonActive,
                    ]}
                    onPress={() => setSelectedRoleId(role.id)}
                  >
                    <ThemedText
                      style={[
                        styles.roleButtonText,
                        selectedRoleId === role.id && styles.roleButtonTextActive,
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
              onPress={() => setIsAdmin(!isAdmin)}
            >
              <MaterialIcons
                name={isAdmin ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={isAdmin ? Colors.primary[500] : Colors.gray[400]}
              />
              <ThemedText style={styles.checkboxLabel}>Admin</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsOwner(!isOwner)}
            >
              <MaterialIcons
                name={isOwner ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={isOwner ? Colors.primary[500] : Colors.gray[400]}
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
              title={isSaving ? 'Saving...' : 'Save Changes'}
              variant="primary"
              onPress={handleSave}
              disabled={isSaving}
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
  userInfo: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.gray[50],
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    color: Colors.text.primary,
  },
  infoText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  form: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
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
