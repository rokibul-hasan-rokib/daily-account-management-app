import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, ActivityIndicator, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAlerts } from '@/contexts/alerts-context';
import { router, useFocusEffect } from 'expo-router';
import { Alert as AlertType } from '@/services/api/types';
import { formatDateRelative } from '@/utils/helpers';

export default function AlertsScreen() {
  const { alerts, isLoading, unreadCount, markAsRead, markAllAsRead, generateAlerts, refreshAlerts } = useAlerts();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const params: any = { ordering: '-created_at' };
      if (filter === 'unread') {
        params.is_read = false;
      } else if (filter === 'read') {
        params.is_read = true;
      }
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      refreshAlerts(params);
    }, [filter, typeFilter, refreshAlerts])
  );

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    
    if (filter === 'unread') {
      filtered = filtered.filter(a => !a.is_read);
    } else if (filter === 'read') {
      filtered = filtered.filter(a => a.is_read);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }
    
    return filtered;
  }, [alerts, filter, typeFilter]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark alert as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all alerts as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All as Read',
          onPress: async () => {
            try {
              await markAllAsRead();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to mark all alerts as read.');
            }
          },
        },
      ]
    );
  };

  const handleGenerateAlerts = async () => {
    try {
      await generateAlerts();
      Alert.alert('Success', 'Alerts generated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate alerts.');
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'bill_due': return 'receipt';
      case 'overspend': return 'account-balance-wallet';
      case 'unusual_spend': return 'warning';
      case 'budget_alert': return 'account-balance';
      default: return 'notifications';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'bill_due': return Colors.error.main;
      case 'overspend': return Colors.warning.main;
      case 'unusual_spend': return Colors.warning.main;
      case 'budget_alert': return Colors.info.main;
      default: return Colors.primary[500];
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
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </ThemedText>
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <MaterialIcons name="done-all" size={20} color={Colors.primary[600]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {(['all', 'unread', 'read'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <ThemedText style={[
                styles.filterButtonText,
                filter === f && styles.filterButtonTextActive
              ]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.typeFilterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {(['all', 'bill_due', 'overspend', 'unusual_spend', 'budget_alert'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeFilterButton, typeFilter === t && styles.typeFilterButtonActive]}
              onPress={() => setTypeFilter(t)}
              activeOpacity={0.7}
            >
              <ThemedText style={[
                styles.typeFilterButtonText,
                typeFilter === t && styles.typeFilterButtonTextActive
              ]}>
                {t === 'all' ? 'All Types' : t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Generate Alerts"
          variant="outline"
          onPress={handleGenerateAlerts}
          style={styles.generateButton}
        />
      </View>

      {/* Alerts List */}
      <View style={styles.alertsList}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <ThemedText style={styles.loadingText}>Loading alerts...</ThemedText>
          </View>
        ) : (
          <>
            {filteredAlerts.map((alert) => (
              <Card 
                key={alert.id} 
                variant="elevated" 
                style={[
                  styles.alertCard,
                  !alert.is_read && styles.alertCardUnread
                ]}
              >
                <TouchableOpacity
                  style={styles.alertHeader}
                  onPress={() => !alert.is_read && handleMarkAsRead(alert.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.alertIcon, { backgroundColor: `${getAlertColor(alert.type)}20` }]}>
                    <MaterialIcons 
                      name={getAlertIcon(alert.type) as any} 
                      size={24} 
                      color={getAlertColor(alert.type)} 
                    />
                  </View>
                  <View style={styles.alertInfo}>
                    <View style={styles.alertTitleRow}>
                      <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
                      {!alert.is_read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                    <ThemedText style={styles.alertMessage}>{alert.message}</ThemedText>
                    <View style={styles.alertMeta}>
                      {alert.type_display && (
                        <Badge 
                          label={alert.type_display} 
                          variant="default" 
                          size="sm" 
                        />
                      )}
                      <Text style={styles.alertDate}>
                        {formatDateRelative(new Date(alert.created_at))}
                      </Text>
                    </View>
                  </View>
                  {!alert.is_read && (
                    <TouchableOpacity
                      style={styles.markReadButton}
                      onPress={() => handleMarkAsRead(alert.id)}
                    >
                      <MaterialIcons name="check-circle-outline" size={24} color={Colors.primary[600]} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </Card>
            ))}

            {/* Empty State */}
            {filteredAlerts.length === 0 && !isLoading && (
              <View style={styles.emptyState}>
                <MaterialIcons name="notifications-off" size={64} color={Colors.text.tertiary} />
                <ThemedText style={styles.emptyTitle}>No alerts found</ThemedText>
                <ThemedText style={styles.emptyText}>
                  {filter !== 'all' || typeFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'You\'re all caught up! No alerts at the moment.'}
                </ThemedText>
              </View>
            )}
          </>
        )}
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
  markAllButton: {
    padding: Spacing.sm,
  },
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filterScroll: {
    marginBottom: Spacing.sm,
  },
  typeFilterScroll: {
    marginBottom: Spacing.md,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    ...Shadows.sm,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  filterButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  filterButtonTextActive: {
    color: Colors.text.inverse,
  },
  typeFilterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  typeFilterButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  typeFilterButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  typeFilterButtonTextActive: {
    color: Colors.text.inverse,
  },
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  generateButton: {
    width: '100%',
  },
  alertsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  alertCard: {
    padding: Spacing.md,
  },
  alertCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
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
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  alertTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[500],
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
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  alertDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  markReadButton: {
    padding: Spacing.xs,
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
