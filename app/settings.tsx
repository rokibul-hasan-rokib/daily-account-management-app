import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Switch, ActivityIndicator, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useProfile } from '@/contexts/profile-context';
import { useFocusEffect } from 'expo-router';

const currencies = [
  { code: 'GBP', label: 'GBP (£) - British Pound' },
  { code: 'USD', label: 'USD ($) - US Dollar' },
  { code: 'EUR', label: 'EUR (€) - Euro' },
  { code: 'JPY', label: 'JPY (¥) - Japanese Yen' },
  { code: 'CAD', label: 'CAD ($) - Canadian Dollar' },
  { code: 'AUD', label: 'AUD ($) - Australian Dollar' },
];

const defaultViews = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'profit-loss', label: 'Profit & Loss' },
];

export default function SettingsScreen() {
  const { profile, isLoading, updateProfile, refreshProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const handleToggle = async (field: keyof typeof profile, value: boolean) => {
    if (!profile) return;
    
    try {
      setIsSaving(true);
      await updateProfile({ [field]: value });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update setting.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    try {
      setIsSaving(true);
      await updateProfile({ currency });
      Alert.alert('Success', 'Currency updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update currency.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDefaultViewChange = async (defaultView: string) => {
    try {
      setIsSaving(true);
      await updateProfile({ default_view: defaultView });
      Alert.alert('Success', 'Default view updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update default view.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAlertDaysChange = async (days: number) => {
    try {
      setIsSaving(true);
      await updateProfile({ alert_days_before: days });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update alert days.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = (id: string, title: string) => {
    Alert.alert('Coming Soon', `${title} functionality will be available in a future update.`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Settings</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Manage app preferences
            </ThemedText>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
        </View>
      ) : profile ? (
        <>
          {/* Profile Settings */}
          <Card variant="elevated" style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Profile Settings</ThemedText>
            <View style={styles.settingsList}>
              {/* Currency */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <MaterialIcons name="attach-money" size={24} color={Colors.primary[600]} />
                  </View>
                  <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingTitle}>Currency</ThemedText>
                    <ThemedText style={styles.settingDescription}>
                      {profile.currency_display || profile.currency}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Select Currency',
                      'Choose your preferred currency',
                      currencies.map(c => ({
                        text: c.label,
                        onPress: () => handleCurrencyChange(c.code),
                      })).concat([{ text: 'Cancel', style: 'cancel' }])
                    );
                  }}
                >
                  <MaterialIcons name="chevron-right" size={24} color={Colors.text.tertiary} />
                </TouchableOpacity>
              </View>

              {/* Default View */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <MaterialIcons name="dashboard" size={24} color={Colors.primary[600]} />
                  </View>
                  <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingTitle}>Default View</ThemedText>
                    <ThemedText style={styles.settingDescription}>
                      {defaultViews.find(v => v.value === profile.default_view)?.label || 'Dashboard'}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Select Default View',
                      'Choose your default view when opening the app',
                      defaultViews.map(v => ({
                        text: v.label,
                        onPress: () => handleDefaultViewChange(v.value),
                      })).concat([{ text: 'Cancel', style: 'cancel' }])
                    );
                  }}
                >
                  <MaterialIcons name="chevron-right" size={24} color={Colors.text.tertiary} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Display Settings */}
          <Card variant="elevated" style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Display Settings</ThemedText>
            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <MaterialIcons name="account-balance-wallet" size={24} color={Colors.primary[600]} />
                  </View>
                  <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingTitle}>Show Balance</ThemedText>
                    <ThemedText style={styles.settingDescription}>
                      Display account balance in dashboard
                    </ThemedText>
                  </View>
                </View>
                <Switch
                  value={profile.show_balance ?? true}
                  onValueChange={(value) => handleToggle('show_balance', value)}
                  trackColor={{ false: Colors.gray[300], true: Colors.primary[500] }}
                  thumbColor={Colors.background.light}
                  disabled={isSaving}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <MaterialIcons name="trending-up" size={24} color={Colors.primary[600]} />
                  </View>
                  <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingTitle}>Show Profit & Loss</ThemedText>
                    <ThemedText style={styles.settingDescription}>
                      Display profit and loss information
                    </ThemedText>
                  </View>
                </View>
                <Switch
                  value={profile.show_profit_loss ?? true}
                  onValueChange={(value) => handleToggle('show_profit_loss', value)}
                  trackColor={{ false: Colors.gray[300], true: Colors.primary[500] }}
                  thumbColor={Colors.background.light}
                  disabled={isSaving}
                />
              </View>
            </View>
          </Card>

          {/* Alert Settings */}
          <Card variant="elevated" style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Alert Settings</ThemedText>
            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <MaterialIcons name="email" size={24} color={Colors.primary[600]} />
                  </View>
                  <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingTitle}>Email Alerts</ThemedText>
                    <ThemedText style={styles.settingDescription}>
                      Receive alerts via email
                    </ThemedText>
                  </View>
                </View>
                <Switch
                  value={profile.email_alerts ?? true}
                  onValueChange={(value) => handleToggle('email_alerts', value)}
                  trackColor={{ false: Colors.gray[300], true: Colors.primary[500] }}
                  thumbColor={Colors.background.light}
                  disabled={isSaving}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <MaterialIcons name="notifications" size={24} color={Colors.primary[600]} />
                  </View>
                  <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingTitle}>Push Alerts</ThemedText>
                    <ThemedText style={styles.settingDescription}>
                      Receive push notifications
                    </ThemedText>
                  </View>
                </View>
                <Switch
                  value={profile.push_alerts ?? false}
                  onValueChange={(value) => handleToggle('push_alerts', value)}
                  trackColor={{ false: Colors.gray[300], true: Colors.primary[500] }}
                  thumbColor={Colors.background.light}
                  disabled={isSaving}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <MaterialIcons name="schedule" size={24} color={Colors.primary[600]} />
                  </View>
                  <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingTitle}>Alert Days Before</ThemedText>
                    <ThemedText style={styles.settingDescription}>
                      Days before bill due date to send alert
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.prompt(
                      'Alert Days Before',
                      'Enter number of days before bill due date to send alert',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Save',
                          onPress: (value) => {
                            const days = parseInt(value || '3');
                            if (days >= 0 && days <= 30) {
                              handleAlertDaysChange(days);
                            } else {
                              Alert.alert('Error', 'Please enter a number between 0 and 30.');
                            }
                          },
                        },
                      ],
                      'plain-text',
                      (profile.alert_days_before || 3).toString()
                    );
                  }}
                >
                  <ThemedText style={styles.settingValue}>
                    {profile.alert_days_before || 3} days
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="settings" size={64} color={Colors.text.tertiary} />
          <ThemedText style={styles.emptyText}>Unable to load profile settings</ThemedText>
        </View>
      )}

      {/* Data Management */}
      <Card variant="elevated" style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Data Management</ThemedText>
        <View style={styles.settingsList}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleAction('export', 'Export Data')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <MaterialIcons name="download" size={24} color={Colors.primary[600]} />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Export Data</ThemedText>
                <ThemedText style={styles.settingDescription}>Download all your data</ThemedText>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleAction('import', 'Import Data')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <MaterialIcons name="upload" size={24} color={Colors.primary[600]} />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Import Data</ThemedText>
                <ThemedText style={styles.settingDescription}>Import data from file</ThemedText>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Actions */}
      <Card variant="elevated" style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Data Management</ThemedText>
        <View style={styles.settingsList}>
          {actionSettings.map((setting) => (
            <TouchableOpacity
              key={setting.id}
              style={styles.settingItem}
              onPress={() => handleAction(setting.id, setting.title)}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <MaterialIcons name={setting.icon as any} size={24} color={Colors.primary[600]} />
                </View>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingTitle}>{setting.title}</ThemedText>
                  <ThemedText style={styles.settingDescription}>{setting.description}</ThemedText>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* About */}
      <Card variant="elevated" style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>About</ThemedText>
        <View style={styles.aboutContent}>
          <ThemedText style={styles.aboutText}>Daily Account</ThemedText>
          <ThemedText style={styles.aboutVersion}>Version 1.0.0</ThemedText>
          <ThemedText style={styles.aboutDescription}>
            Finance management made simple. Track your income, expenses, and gain insights into your spending habits.
          </ThemedText>
        </View>
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>© 2024 Daily Account. All rights reserved.</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },
  settingsList: {
    gap: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  settingValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
  loadingContainer: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  aboutContent: {
    alignItems: 'center',
  },
  aboutText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  aboutVersion: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  aboutDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
});
