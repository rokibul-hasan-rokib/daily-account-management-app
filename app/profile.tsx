import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing } from '@/constants/design-system';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useProfile } from '@/contexts/profile-context';
import { useAuth } from '@/contexts/auth-context';

export default function ProfileScreen() {
  const { profile, isLoading, refreshProfile, updateProfile } = useProfile();
  const { user, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [currency, setCurrency] = useState('');
  const [defaultView, setDefaultView] = useState('');

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  // Sync form state when profile loads
  useFocusEffect(
    useCallback(() => {
      if (profile) {
        setCurrency(profile.currency || 'GBP');
        setDefaultView(profile.default_view || 'dashboard');
      }
    }, [profile])
  );

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        currency,
        default_view: defaultView,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login' as any);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const currencies = [
    { code: 'GBP', label: '£ GBP', full: 'British Pound' },
    { code: 'USD', label: '$ USD', full: 'US Dollar' },
    { code: 'EUR', label: '€ EUR', full: 'Euro' },
    { code: 'JPY', label: '¥ JPY', full: 'Japanese Yen' },
    { code: 'CAD', label: '$ CAD', full: 'Canadian Dollar' },
    { code: 'AUD', label: '$ AUD', full: 'Australian Dollar' },
  ];

  const views = [
    { value: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { value: 'transactions', label: 'Transactions', icon: 'receipt' },
    { value: 'profit-loss', label: 'Profit & Loss', icon: 'trending-up' },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MenuButton />
            <View>
              <ThemedText type="title" style={styles.headerTitle}>Profile</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Manage your account
              </ThemedText>
            </View>
          </View>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <MaterialIcons name="edit" size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <MaterialIcons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* User Info Card */}
        <Card variant="elevated" style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {(user?.username || 'U').charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.userName}>{user?.username || 'User'}</ThemedText>
          <ThemedText style={styles.userEmail}>{user?.email || 'No email'}</ThemedText>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{profile?.currency || 'GBP'}</ThemedText>
              <ThemedText style={styles.statLabel}>Currency</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {views.find(v => v.value === profile?.default_view)?.label || 'Dashboard'}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Default View</ThemedText>
            </View>
          </View>
        </Card>

        {/* Account Details */}
        <Card variant="elevated" style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Account Details</ThemedText>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialIcons name="person" size={20} color={Colors.primary[600]} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Username</ThemedText>
              <ThemedText style={styles.detailValue}>{user?.username || 'N/A'}</ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialIcons name="email" size={20} color={Colors.primary[600]} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Email</ThemedText>
              <ThemedText style={styles.detailValue}>{user?.email || 'N/A'}</ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialIcons name="calendar-today" size={20} color={Colors.primary[600]} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Member Since</ThemedText>
              <ThemedText style={styles.detailValue}>
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* Preferences */}
        {isEditing ? (
          <Card variant="elevated" style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>Edit Preferences</ThemedText>

            {/* Currency Selection */}
            <View style={styles.editSection}>
              <ThemedText style={styles.editLabel}>Currency</ThemedText>
              <View style={styles.optionGrid}>
                {currencies.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.optionButton, currency === c.code && styles.optionButtonActive]}
                    onPress={() => setCurrency(c.code)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={[styles.optionText, currency === c.code && styles.optionTextActive]}>
                      {c.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Default View Selection */}
            <View style={styles.editSection}>
              <ThemedText style={styles.editLabel}>Default View</ThemedText>
              <View style={styles.optionGrid}>
                {views.map((v) => (
                  <TouchableOpacity
                    key={v.value}
                    style={[styles.optionButton, defaultView === v.value && styles.optionButtonActive]}
                    onPress={() => setDefaultView(v.value)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={v.icon as any}
                      size={16}
                      color={defaultView === v.value ? Colors.text.inverse : Colors.text.secondary}
                    />
                    <ThemedText style={[styles.optionText, defaultView === v.value && styles.optionTextActive]}>
                      {v.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.editActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsEditing(false)}
                style={styles.cancelButton}
                disabled={isSaving}
              />
              <Button
                title={isSaving ? 'Saving...' : 'Save Changes'}
                variant="primary"
                onPress={handleSave}
                style={styles.saveButton}
                disabled={isSaving}
              />
            </View>
          </Card>
        ) : (
          <Card variant="elevated" style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>

            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <MaterialIcons name="attach-money" size={20} color={Colors.primary[600]} />
                <View>
                  <ThemedText style={styles.prefLabel}>Currency</ThemedText>
                  <ThemedText style={styles.prefValue}>
                    {profile?.currency_display || profile?.currency || 'GBP'}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <MaterialIcons name="dashboard" size={20} color={Colors.primary[600]} />
                <View>
                  <ThemedText style={styles.prefLabel}>Default View</ThemedText>
                  <ThemedText style={styles.prefValue}>
                    {views.find(v => v.value === profile?.default_view)?.label || 'Dashboard'}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <MaterialIcons name="visibility" size={20} color={Colors.primary[600]} />
                <View>
                  <ThemedText style={styles.prefLabel}>Show Balance</ThemedText>
                  <ThemedText style={styles.prefValue}>
                    {profile?.show_balance ? 'Enabled' : 'Disabled'}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <MaterialIcons name="notifications" size={20} color={Colors.primary[600]} />
                <View>
                  <ThemedText style={styles.prefLabel}>Email Alerts</ThemedText>
                  <ThemedText style={styles.prefValue}>
                    {profile?.email_alerts ? 'Enabled' : 'Disabled'}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <Card variant="elevated" style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/settings' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.primary[100] }]}>
                <MaterialIcons name="settings" size={20} color={Colors.primary[600]} />
              </View>
              <ThemedText style={styles.actionText}>App Settings</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/budgets' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.success.light }]}>
                <MaterialIcons name="account-balance-wallet" size={20} color={Colors.success.dark} />
              </View>
              <ThemedText style={styles.actionText}>My Budgets</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, styles.logoutRow]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.error.light }]}>
                <MaterialIcons name="logout" size={20} color={Colors.error.dark} />
              </View>
              <ThemedText style={[styles.actionText, { color: Colors.error.main }]}>Logout</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.error.main} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
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
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[50],
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
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
  userCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray[200],
  },
  statValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  sectionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  editSection: {
    marginBottom: Spacing.lg,
  },
  editLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  optionButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  optionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  optionTextActive: {
    color: Colors.text.inverse,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  prefLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  prefValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  logoutRow: {
    borderBottomWidth: 0,
  },
});
