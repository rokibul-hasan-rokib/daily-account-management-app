import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Switch } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Setting {
  id: string;
  title: string;
  description: string;
  type: 'switch' | 'button';
  value?: boolean;
  icon: string;
}

const settings: Setting[] = [
  { id: '1', title: 'Dark Mode', description: 'Switch to dark theme', type: 'switch', value: false, icon: 'dark-mode' },
  { id: '2', title: 'Notifications', description: 'Enable push notifications', type: 'switch', value: true, icon: 'notifications' },
  { id: '3', title: 'Biometric Lock', description: 'Use fingerprint or face ID', type: 'switch', value: false, icon: 'fingerprint' },
  { id: '4', title: 'Auto-Backup', description: 'Automatically backup data to cloud', type: 'switch', value: true, icon: 'cloud-upload' },
];

const actionSettings: Setting[] = [
  { id: '5', title: 'Export Data', description: 'Download all your data', type: 'button', icon: 'download' },
  { id: '6', title: 'Import Data', description: 'Import data from file', type: 'button', icon: 'upload' },
  { id: '7', title: 'Clear Cache', description: 'Free up storage space', type: 'button', icon: 'delete-outline' },
];

export default function SettingsScreen() {
  const [settingsState, setSettingsState] = useState(settings);

  const toggleSetting = (id: string) => {
    setSettingsState(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value: !setting.value } : setting
    ));
  };

  const handleAction = (id: string, title: string) => {
    alert(`${title} functionality coming soon!`);
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

      {/* App Settings */}
      <Card variant="elevated" style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>App Settings</ThemedText>
        <View style={styles.settingsList}>
          {settingsState.map((setting) => (
            <View key={setting.id} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <MaterialIcons name={setting.icon as any} size={24} color={Colors.primary[600]} />
                </View>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingTitle}>{setting.title}</ThemedText>
                  <ThemedText style={styles.settingDescription}>{setting.description}</ThemedText>
                </View>
              </View>
              {setting.type === 'switch' && (
                <Switch
                  value={setting.value}
                  onValueChange={() => toggleSetting(setting.id)}
                  trackColor={{ false: Colors.gray[300], true: Colors.primary[500] }}
                  thumbColor={Colors.background.light}
                />
              )}
            </View>
          ))}
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
