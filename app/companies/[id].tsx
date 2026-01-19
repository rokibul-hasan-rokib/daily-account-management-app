/**
 * Company Details Screen
 * Shows detailed information about a company
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { useCompany } from '@/contexts/company-context';
import { CompaniesService } from '@/services/api';
import { Company } from '@/services/api/types';

export default function CompanyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { switchCompany, isSuperAdmin } = useCompany();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    loadCompanyDetails();
  }, [id]);

  const loadCompanyDetails = async () => {
    try {
      setIsLoading(true);
      const companyId = parseInt(id || '0', 10);
      const details = await CompaniesService.getCompanyDetails(companyId);
      setCompany(details);
    } catch (error: any) {
      console.error('Error loading company details:', error);
      Alert.alert('Error', error.message || 'Failed to load company details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchCompany = async () => {
    if (!company) return;
    try {
      await switchCompany(company.id);
      Alert.alert('Success', 'Company switched successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to switch company');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <ThemedText style={styles.loadingText}>Loading company details...</ThemedText>
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={48} color={Colors.error[500]} />
        <ThemedText style={styles.errorText}>Company not found</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.companyName}>{company.name}</ThemedText>
          {company.status && (
            <View style={[styles.statusBadge, { backgroundColor: company.status === 'active' ? Colors.success[500] : Colors.error[500] }]}>
              <ThemedText style={styles.statusText}>{company.status_display || company.status}</ThemedText>
            </View>
          )}
        </View>

        {company.email && (
          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={20} color={Colors.text.secondary} />
            <ThemedText style={styles.detailText}>{company.email}</ThemedText>
          </View>
        )}

        {company.phone && (
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={20} color={Colors.text.secondary} />
            <ThemedText style={styles.detailText}>{company.phone}</ThemedText>
          </View>
        )}

        {company.domain && (
          <View style={styles.detailRow}>
            <MaterialIcons name="language" size={20} color={Colors.text.secondary} />
            <ThemedText style={styles.detailText}>{company.domain}</ThemedText>
          </View>
        )}

        {company.address && (
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={20} color={Colors.text.secondary} />
            <ThemedText style={styles.detailText}>{company.address}</ThemedText>
          </View>
        )}

        {company.plan_display && (
          <View style={styles.detailRow}>
            <MaterialIcons name="star" size={20} color={Colors.text.secondary} />
            <ThemedText style={styles.detailText}>{company.plan_display}</ThemedText>
          </View>
        )}

        {company.subscription_start && company.subscription_end && (
          <View style={styles.detailRow}>
            <MaterialIcons name="calendar-today" size={20} color={Colors.text.secondary} />
            <ThemedText style={styles.detailText}>
              {new Date(company.subscription_start).toLocaleDateString()} - {new Date(company.subscription_end).toLocaleDateString()}
            </ThemedText>
          </View>
        )}
      </Card>

      {company.stats && (
        <Card variant="elevated" style={styles.card}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Statistics</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{company.stats.total_users}</ThemedText>
              <ThemedText style={styles.statLabel}>Users</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{company.stats.total_transactions}</ThemedText>
              <ThemedText style={styles.statLabel}>Transactions</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{company.stats.total_liabilities}</ThemedText>
              <ThemedText style={styles.statLabel}>Bills</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{company.stats.total_receipts}</ThemedText>
              <ThemedText style={styles.statLabel}>Receipts</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>${parseFloat(company.stats.total_income.toString()).toFixed(2)}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Income</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>${parseFloat(company.stats.total_expenses.toString()).toFixed(2)}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Expenses</ThemedText>
            </View>
            <View style={[styles.statItem, styles.statItemFull]}>
              <ThemedText style={styles.statValue}>${parseFloat(company.stats.net_balance.toString()).toFixed(2)}</ThemedText>
              <ThemedText style={styles.statLabel}>Net Balance</ThemedText>
            </View>
          </View>
        </Card>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/companies/users?companyId=${company.id}`)}
        >
          <MaterialIcons name="people" size={20} color={Colors.primary[500]} />
          <ThemedText style={styles.actionButtonText}>View Users</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/companies/roles?companyId=${company.id}`)}
        >
          <MaterialIcons name="admin-panel-settings" size={20} color={Colors.primary[500]} />
          <ThemedText style={styles.actionButtonText}>View Roles</ThemedText>
        </TouchableOpacity>

        {isSuperAdmin && (
          <TouchableOpacity
            style={[styles.actionButton, styles.switchButton]}
            onPress={handleSwitchCompany}
          >
            <MaterialIcons name="swap-horiz" size={20} color={Colors.background.light} />
            <ThemedText style={[styles.actionButtonText, styles.switchButtonText]}>Switch to This Company</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.error[500],
  },
  backButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary[500],
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.background.light,
    fontWeight: '600',
  },
  card: {
    margin: Spacing.md,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  companyName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.background.light,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    flex: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
  },
  statItemFull: {
    minWidth: '100%',
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.primary[600],
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  actionsContainer: {
    margin: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.light,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary[500],
    gap: Spacing.sm,
  },
  switchButton: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
    marginTop: Spacing.sm,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.primary[500],
  },
  switchButtonText: {
    color: Colors.background.light,
  },
});