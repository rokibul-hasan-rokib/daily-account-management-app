/**
 * Add Role Screen
 * Allows creating a new role for the company
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Colors, Spacing, Typography } from '@/constants/design-system';
import { RolesService, PermissionsService } from '@/services/api';
import { RoleRequest, Permission } from '@/services/api/types';
import { useRoles } from '@/contexts/roles-context';
import { useCompany } from '@/contexts/company-context';

export default function AddRoleScreen() {
  const router = useRouter();
  const { currentCompany } = useCompany();
  const { loadRoles } = useRoles();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [formData, setFormData] = useState<RoleRequest>({
    company: currentCompany?.id || 0,
    name: '',
    description: '',
    permission_ids: [],
    is_default: false,
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await PermissionsService.getPermissions();
      setPermissions(response.results || []);
    } catch (error: any) {
      console.error('Error loading permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (permissionId: number) => {
    const currentIds = formData.permission_ids || [];
    if (currentIds.includes(permissionId)) {
      setFormData({
        ...formData,
        permission_ids: currentIds.filter((id) => id !== permissionId),
      });
    } else {
      setFormData({
        ...formData,
        permission_ids: [...currentIds, permissionId],
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      Alert.alert('Validation Error', 'Please enter a role name');
      return;
    }

    if (!formData.company || formData.company === 0) {
      Alert.alert('Validation Error', 'Company not selected');
      return;
    }

    try {
      setIsSaving(true);
      await RolesService.createRole(formData);
      await loadRoles();
      Alert.alert('Success', 'Role created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error creating role:', error);
      Alert.alert('Error', error.message || 'Failed to create role');
    } finally {
      setIsSaving(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

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
            <ThemedText type="title" style={styles.headerTitle}>New Role</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Create a new role for {currentCompany?.name}</ThemedText>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Role Name *"
            placeholder="e.g., Manager, Editor, Viewer"
            value={formData.name || ''}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            leftIcon={<MaterialIcons name="badge" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Description"
            placeholder="Role description"
            value={formData.description || ''}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={3}
            leftIcon={<MaterialIcons name="description" size={20} color={Colors.primary[500]} />}
            containerStyle={styles.inputContainer}
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({ ...formData, is_default: !formData.is_default })}
            >
              <MaterialIcons
                name={formData.is_default ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={formData.is_default ? Colors.primary[500] : Colors.gray[400]}
              />
              <ThemedText style={styles.checkboxLabel}>Set as default role</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Permissions */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Permissions</ThemedText>
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <View key={category} style={styles.permissionGroup}>
                <ThemedText style={styles.categoryLabel}>{category.toUpperCase()}</ThemedText>
                {perms.map((permission) => {
                  const isSelected = formData.permission_ids?.includes(permission.id) || false;
                  return (
                    <TouchableOpacity
                      key={permission.id}
                      style={[
                        styles.permissionButton,
                        isSelected && styles.permissionButtonActive,
                      ]}
                      onPress={() => togglePermission(permission.id)}
                    >
                      <MaterialIcons
                        name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
                        size={20}
                        color={isSelected ? Colors.primary[500] : Colors.gray[400]}
                      />
                      <View style={styles.permissionInfo}>
                        <ThemedText
                          style={[
                            styles.permissionName,
                            isSelected && styles.permissionNameActive,
                          ]}
                        >
                          {permission.name}
                        </ThemedText>
                        {permission.description && (
                          <ThemedText style={styles.permissionDescription}>
                            {permission.description}
                          </ThemedText>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
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
              title={isSaving ? 'Creating...' : 'Create Role'}
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
    marginBottom: Spacing.md,
  },
  checkboxContainer: {
    marginBottom: Spacing.lg,
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
  permissionGroup: {
    marginBottom: Spacing.lg,
  },
  categoryLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.gray[50],
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  permissionButtonActive: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  permissionInfo: {
    flex: 1,
  },
  permissionName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  permissionNameActive: {
    color: Colors.primary[600],
  },
  permissionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
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
