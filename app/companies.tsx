/**
 * Companies Screen
 * Lists all companies (Super Admin only) or current company details
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { useCompany } from '@/contexts/company-context';
import { Company } from '@/services/api/types';

export default function CompaniesScreen() {
  const { companies, currentCompany, isLoading, isSuperAdmin, loadCompanies, switchCompany } = useCompany();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [switching, setSwitching] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load companies when screen is focused (only once per focus)
  useFocusEffect(
    useCallback(() => {
      if (!hasLoaded && !isLoading) {
        setHasLoaded(true);
        loadCompanies();
      }
      return () => {
        // Reset when screen loses focus
        setHasLoaded(false);
      };
    }, [hasLoaded, isLoading])
  );

  // Set selected company when current company changes
  React.useEffect(() => {
    if (currentCompany) {
      setSelectedCompanyId(currentCompany.id);
    }
  }, [currentCompany]);

  const handleSelectCompany = async () => {
    if (!selectedCompanyId) {
      Alert.alert('Error', 'Please select a company');
      return;
    }

    if (selectedCompanyId === currentCompany?.id) {
      Alert.alert('Info', 'This company is already selected');
      return;
    }

    try {
      setSwitching(true);
      await switchCompany(selectedCompanyId);
      Alert.alert('Success', 'Company switched successfully', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to switch company');
    } finally {
      setSwitching(false);
    }
  };

  if (isLoading && companies.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <ThemedText style={styles.loadingText}>Loading companies...</ThemedText>
      </View>
    );
  }

  // Show empty state if no companies and not loading
  if (!isLoading && companies.length === 0 && !currentCompany) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="business" size={48} color={Colors.text.tertiary} />
        <ThemedText style={styles.emptyText}>No companies found</ThemedText>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadCompanies()}
        >
          <MaterialIcons name="refresh" size={20} color={Colors.primary[500]} />
          <ThemedText style={styles.refreshButtonText}>Refresh</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  // If not super admin and has a company, show company details directly
  if (!isSuperAdmin && currentCompany) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialIcons name="business" size={24} color={Colors.primary[500]} />
            <ThemedText type="title" style={styles.pageTitle}>My Company</ThemedText>
          </View>
        </View>

        <Card variant="elevated" style={styles.companyCard}>
          <View style={styles.companyHeader}>
            <View style={styles.companyInfo}>
              <ThemedText type="title" style={styles.companyName}>{currentCompany.name}</ThemedText>
              {currentCompany.status && (
                <View style={[styles.statusBadge, { backgroundColor: currentCompany.status === 'active' ? Colors.success[500] : Colors.error[500] }]}>
                  <ThemedText style={styles.statusText}>{currentCompany.status_display || currentCompany.status}</ThemedText>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => router.push(`/companies/${currentCompany.id}`)}
            >
              <MaterialIcons name="chevron-right" size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
          
          {currentCompany.email && (
            <View style={styles.detailRow}>
              <MaterialIcons name="email" size={20} color={Colors.text.secondary} />
              <ThemedText style={styles.detailText}>{currentCompany.email}</ThemedText>
            </View>
          )}
          
          {currentCompany.phone && (
            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={20} color={Colors.text.secondary} />
              <ThemedText style={styles.detailText}>{currentCompany.phone}</ThemedText>
            </View>
          )}

          {currentCompany.stats && (
            <View style={styles.statsContainer}>
              <ThemedText type="subtitle" style={styles.statsTitle}>Statistics</ThemedText>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>{currentCompany.stats.total_users}</ThemedText>
                  <ThemedText style={styles.statLabel}>Users</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>{currentCompany.stats.total_transactions}</ThemedText>
                  <ThemedText style={styles.statLabel}>Transactions</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>{currentCompany.stats.total_receipts}</ThemedText>
                  <ThemedText style={styles.statLabel}>Receipts</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>${parseFloat(currentCompany.stats.net_balance.toString()).toFixed(2)}</ThemedText>
                  <ThemedText style={styles.statLabel}>Net Balance</ThemedText>
                </View>
              </View>
            </View>
          )}
        </Card>
      </ScrollView>
    );
  }

  // Super admin view - company selection interface
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="business" size={24} color={Colors.primary[500]} />
          <ThemedText type="title" style={styles.pageTitle}>Select Company</ThemedText>
        </View>
      </View>

      {/* Super Admin Mode Banner */}
      {isSuperAdmin && (
        <View style={styles.banner}>
          <MaterialIcons name="lock" size={20} color={Colors.primary[600]} />
          <ThemedText style={styles.bannerText}>Super Admin Mode: You can select any company.</ThemedText>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Select a Company</ThemedText>

        {companies.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <MaterialIcons name="business" size={48} color={Colors.text.tertiary} />
            <ThemedText style={styles.emptyText}>No companies found</ThemedText>
          </Card>
        ) : (
          companies.map((company) => {
            const isSelected = selectedCompanyId === company.id;
            const isCurrent = currentCompany?.id === company.id;

            return (
              <TouchableOpacity
                key={company.id}
                onPress={() => setSelectedCompanyId(company.id)}
                activeOpacity={0.7}
              >
                <Card
                  variant="elevated"
                  style={[
                    styles.companyCard,
                    isSelected && styles.companyCardSelected,
                  ]}
                >
                  <View style={styles.companyCardContent}>
                    <View style={styles.radioContainer}>
                      <View
                        style={[
                          styles.radio,
                          isSelected && styles.radioSelected,
                        ]}
                      >
                        {isSelected && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    </View>

                    <View style={styles.companyInfoContainer}>
                      <View style={styles.companyNameRow}>
                        <ThemedText type="title" style={styles.companyName}>
                          {company.name}
                        </ThemedText>
                        {isCurrent && (
                          <View style={styles.currentBadge}>
                            <MaterialIcons name="check-circle" size={16} color={Colors.primary[500]} />
                            <ThemedText style={styles.currentText}>Current</ThemedText>
                          </View>
                        )}
                      </View>

                      <View style={styles.companyDetails}>
                        {company.plan_display && (
                          <View style={styles.detailItem}>
                            <ThemedText style={styles.detailLabel}>Plan:</ThemedText>
                            <ThemedText style={styles.detailValue}>{company.plan_display}</ThemedText>
                          </View>
                        )}
                        <View style={styles.detailItem}>
                          <ThemedText style={styles.detailLabel}>Users:</ThemedText>
                          <ThemedText style={styles.detailValue}>
                            {company.user_count ?? company.stats?.total_users ?? 0}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    <MaterialIcons
                      name="business"
                      size={24}
                      color={isSelected ? Colors.primary[500] : Colors.text.tertiary}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Select Company Button */}
      {isSuperAdmin && companies.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleSelectCompany}
            disabled={!selectedCompanyId || switching || selectedCompanyId === currentCompany?.id}
            style={[
              styles.selectButton,
              (!selectedCompanyId || switching || selectedCompanyId === currentCompany?.id) && styles.selectButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            {switching ? (
              <ActivityIndicator size="small" color={Colors.background.light} />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={20} color={Colors.background.light} />
                <ThemedText style={styles.selectButtonText}>Select Company</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  header: {
    backgroundColor: Colors.background.light,
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  bannerText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[700],
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  companyCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  companyCardSelected: {
    borderColor: Colors.primary[500],
    borderWidth: 2,
    backgroundColor: Colors.primary[50],
  },
  companyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  radioContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary[500],
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary[500],
  },
  companyInfoContainer: {
    flex: 1,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  companyName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  currentText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  companyDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  companyInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  detailsButton: {
    padding: Spacing.xs,
  },
  statsContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  statsTitle: {
    marginBottom: Spacing.sm,
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
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
    padding: Spacing.sm,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
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
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.background.light,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary[500],
    borderRadius: 8,
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.background.light,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: 8,
    gap: Spacing.sm,
  },
  refreshButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary[500],
    fontWeight: '600',
  },
});