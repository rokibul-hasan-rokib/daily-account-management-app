/**
 * Company Roles Screen
 * Lists all roles in the current company
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { useRoles } from '@/contexts/roles-context';
import { Role } from '@/services/api/types';

export default function CompanyRolesScreen() {
  const router = useRouter();
  const { roles, isLoading, loadRoles, deleteRole } = useRoles();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadRoles();
    }, [loadRoles])
  );

  // Server-side search with debounce
  React.useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (searchQuery.trim()) {
        loadRoles({ search: searchQuery, ordering: 'name' });
      } else {
        loadRoles({ ordering: 'name' });
      }
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery]);

  const filteredRoles = roles; // No client-side filtering needed, API handles it

  const handleDeleteRole = async (id: number, name: string, isSystem: boolean) => {
    if (isSystem) {
      Alert.alert('Error', 'System roles cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Role',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRole(id);
              Alert.alert('Success', 'Role deleted successfully');
            } catch (error: any) {
              console.error('Error deleting role:', error);
              const errorMessage = error.message || 'Failed to delete role';
              if (errorMessage.includes('system') || errorMessage.includes('System')) {
                Alert.alert('Error', 'System roles cannot be deleted');
              } else {
                Alert.alert('Error', errorMessage);
              }
            }
          },
        },
      ]
    );
  };

  if (isLoading && roles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <ThemedText style={styles.loadingText}>Loading roles...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="admin-panel-settings" size={24} color={Colors.primary[500]} />
          <ThemedText type="title" style={styles.pageTitle}>Company Roles</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/companies/roles/add')}
        >
          <MaterialIcons name="add" size={24} color={Colors.background.light} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search roles..."
          placeholderTextColor={Colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <MaterialIcons name="close" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredRoles.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <MaterialIcons name="admin-panel-settings" size={48} color={Colors.text.tertiary} />
            <ThemedText style={styles.emptyText}>No roles found</ThemedText>
          </Card>
        ) : (
          filteredRoles.map((role) => (
            <Card key={role.id} variant="elevated" style={styles.roleCard}>
              <View style={styles.roleHeader}>
                <View style={styles.roleInfo}>
                  <ThemedText type="title" style={styles.roleName}>{role.name}</ThemedText>
                  {role.is_default && (
                    <View style={styles.defaultBadge}>
                      <ThemedText style={styles.defaultText}>Default</ThemedText>
                    </View>
                  )}
                  {role.is_system && (
                    <View style={styles.systemBadge}>
                      <ThemedText style={styles.systemText}>System</ThemedText>
                    </View>
                  )}
                </View>
              </View>

              {role.description && (
                <ThemedText style={styles.roleDescription}>{role.description}</ThemedText>
              )}

              {role.permissions && role.permissions.length > 0 && (
                <View style={styles.permissionsContainer}>
                  <ThemedText style={styles.permissionsLabel}>
                    {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                  </ThemedText>
                  <View style={styles.permissionsList}>
                    {role.permissions.slice(0, 3).map((permission) => (
                      <View key={permission.id} style={styles.permissionTag}>
                        <ThemedText style={styles.permissionText}>{permission.name}</ThemedText>
                      </View>
                    ))}
                    {role.permissions.length > 3 && (
                      <View style={styles.permissionTag}>
                        <ThemedText style={styles.permissionText}>
                          +{role.permissions.length - 3} more
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {role.user_count !== undefined && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="people" size={16} color={Colors.text.secondary} />
                  <ThemedText style={styles.detailText}>
                    {role.user_count} user{role.user_count !== 1 ? 's' : ''}
                  </ThemedText>
                </View>
              )}

              <View style={styles.roleActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push(`/companies/roles/${role.id}`)}
                >
                  <MaterialIcons name="edit" size={18} color={Colors.primary[500]} />
                  <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                </TouchableOpacity>
                {!role.is_system && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRole(role.id, role.name, role.is_system || false)}
                  >
                    <MaterialIcons name="delete-outline" size={18} color={Colors.error[500]} />
                    <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pageTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  roleCard: {
    margin: Spacing.md,
    padding: Spacing.md,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  roleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  roleName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '600',
    color: Colors.text.primary,
  },
  defaultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
  },
  defaultText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  systemBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  systemText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  permissionsContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  permissionsLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  permissionTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
  },
  permissionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  roleActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  editButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary[500],
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.error[500],
    fontWeight: '600',
  },
  emptyCard: {
    margin: Spacing.md,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
});