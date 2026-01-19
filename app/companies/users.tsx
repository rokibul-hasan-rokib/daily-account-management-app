/**
 * Company Users Screen
 * Lists all users in the current company
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { useCompanyUsers } from '@/contexts/company-users-context';
import { CompanyUser } from '@/services/api/types';

export default function CompanyUsersScreen() {
  const router = useRouter();
  const { companyUsers, isLoading, loadCompanyUsers, deleteCompanyUser } = useCompanyUsers();
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadCompanyUsers();
    }, [loadCompanyUsers])
  );

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return companyUsers;
    const query = searchQuery.toLowerCase();
    return companyUsers.filter(
      user =>
        user.user.username.toLowerCase().includes(query) ||
        user.user.email.toLowerCase().includes(query) ||
        user.user.first_name?.toLowerCase().includes(query) ||
        user.user.last_name?.toLowerCase().includes(query)
    );
  }, [companyUsers, searchQuery]);

  const handleDeleteUser = async (id: number, username: string) => {
    Alert.alert(
      'Remove User',
      `Are you sure you want to remove "${username}" from this company?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCompanyUser(id);
              Alert.alert('Success', 'User removed successfully');
            } catch (error: any) {
              console.error('Error removing user:', error);
              Alert.alert('Error', error.message || 'Failed to remove user');
            }
          },
        },
      ]
    );
  };

  if (isLoading && companyUsers.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <ThemedText style={styles.loadingText}>Loading users...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="people" size={24} color={Colors.primary[500]} />
          <ThemedText type="title" style={styles.pageTitle}>Company Users</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/companies/users/add')}
        >
          <MaterialIcons name="add" size={24} color={Colors.background.light} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
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
        {filteredUsers.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <MaterialIcons name="people-outline" size={48} color={Colors.text.tertiary} />
            <ThemedText style={styles.emptyText}>No users found</ThemedText>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} variant="elevated" style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <ThemedText type="title" style={styles.userName}>
                    {user.user.first_name && user.user.last_name
                      ? `${user.user.first_name} ${user.user.last_name}`
                      : user.user.username}
                  </ThemedText>
                  <ThemedText style={styles.userEmail}>{user.user.email}</ThemedText>
                </View>
                {user.is_admin && (
                  <View style={styles.adminBadge}>
                    <MaterialIcons name="admin-panel-settings" size={16} color={Colors.primary[500]} />
                    <ThemedText style={styles.adminText}>Admin</ThemedText>
                  </View>
                )}
                {user.is_owner && (
                  <View style={styles.ownerBadge}>
                    <MaterialIcons name="star" size={16} color={Colors.warning[500]} />
                    <ThemedText style={styles.ownerText}>Owner</ThemedText>
                  </View>
                )}
              </View>

              {user.role && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="badge" size={16} color={Colors.text.secondary} />
                  <ThemedText style={styles.detailText}>{user.role.name}</ThemedText>
                </View>
              )}

              <View style={styles.detailRow}>
                <MaterialIcons name="circle" size={12} color={user.is_active ? Colors.success[500] : Colors.error[500]} />
                <ThemedText style={styles.detailText}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </ThemedText>
              </View>

              {user.joined_at && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="calendar-today" size={16} color={Colors.text.secondary} />
                  <ThemedText style={styles.detailText}>
                    Joined {new Date(user.joined_at).toLocaleDateString()}
                  </ThemedText>
                </View>
              )}

              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push(`/companies/users/${user.id}`)}
                >
                  <MaterialIcons name="edit" size={18} color={Colors.primary[500]} />
                  <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                </TouchableOpacity>
                {!user.is_owner && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteUser(user.id, user.user.username)}
                  >
                    <MaterialIcons name="delete-outline" size={18} color={Colors.error[500]} />
                    <ThemedText style={styles.deleteButtonText}>Remove</ThemedText>
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
  userCard: {
    margin: Spacing.md,
    padding: Spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '600',
    color: Colors.text.primary,
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    gap: 4,
  },
  adminText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.warning[50],
    borderRadius: 12,
    gap: 4,
    marginLeft: Spacing.xs,
  },
  ownerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.warning[600],
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  userActions: {
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