import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Switch } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Alert {
  id: string;
  type: 'bill' | 'budget' | 'transaction' | 'reminder';
  title: string;
  message: string;
  enabled: boolean;
  frequency: string;
}

const dummyAlerts: Alert[] = [
  { id: '1', type: 'bill', title: 'Bill Due Reminder', message: 'Get notified 3 days before bills are due', enabled: true, frequency: '3 days before' },
  { id: '2', type: 'budget', title: 'Budget Exceeded', message: 'Alert when you exceed monthly budget', enabled: true, frequency: 'Immediately' },
  { id: '3', type: 'transaction', title: 'Large Transaction', message: 'Notify for transactions over £500', enabled: false, frequency: 'Immediately' },
  { id: '4', type: 'reminder', title: 'Weekly Summary', message: 'Receive weekly spending summary', enabled: true, frequency: 'Weekly' },
];

export default function AlertsScreen() {
  const [alerts] = useState<Alert[]>(dummyAlerts);

  const toggleAlert = (id: string) => {
    console.log('Toggling alert:', id);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'bill': return 'receipt';
      case 'budget': return 'account-balance-wallet';
      case 'transaction': return 'payment';
      case 'reminder': return 'notifications';
      default: return 'info';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'bill': return Colors.error.main;
      case 'budget': return Colors.warning.main;
      case 'transaction': return Colors.info.main;
      case 'reminder': return Colors.primary[500];
      default: return Colors.gray[500];
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Alerts</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Manage your notifications
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Info Card */}
      <Card variant="outlined" style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <MaterialIcons name="notifications-active" size={20} color={Colors.info.main} />
          <ThemedText style={styles.infoText}>
            Stay informed about your finances with customizable alerts and notifications.
          </ThemedText>
        </View>
      </Card>

      {/* Alerts List */}
      <View style={styles.alertsList}>
        {alerts.map((alert) => (
          <Card key={alert.id} variant="elevated" style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={[styles.alertIcon, { backgroundColor: `${getAlertColor(alert.type)}20` }]}>
                <MaterialIcons 
                  name={getAlertIcon(alert.type) as any} 
                  size={24} 
                  color={getAlertColor(alert.type)} 
                />
              </View>
              <View style={styles.alertInfo}>
                <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
                <ThemedText style={styles.alertMessage}>{alert.message}</ThemedText>
                <View style={styles.alertMeta}>
                  <Badge label={alert.frequency} variant="default" size="sm" />
                </View>
              </View>
              <Switch
                value={alert.enabled}
                onValueChange={() => toggleAlert(alert.id)}
                trackColor={{ false: Colors.gray[300], true: Colors.primary[500] }}
                thumbColor={Colors.background.light}
              />
            </View>
          </Card>
        ))}
      </View>

      {/* Empty State */}
      {alerts.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialIcons name="notifications-off" size={64} color={Colors.text.tertiary} />
          <ThemedText style={styles.emptyTitle}>No alerts configured</ThemedText>
          <ThemedText style={styles.emptyText}>
            Enable alerts to stay on top of your finances
          </ThemedText>
        </View>
      )}
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
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.info.light,
    borderColor: Colors.info.main,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  alertsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  alertCard: {
    padding: Spacing.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  alertMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.fontSize.sm * 1.4,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
