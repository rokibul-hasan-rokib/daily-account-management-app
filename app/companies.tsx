/**
 * Companies Screen
 * Lists all companies (Super Admin only) or current company details
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
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
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadCompanies();
    }, [loadCompanies])
  );

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const query = searchQuery.toLowerCase();
    return companies.filter(
      company =>
        company.name.toLowerCase().includes(query) ||
        company.email?.toLowerCase().includes(query) ||
        company.domain?.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

  const handleCompanyPress = (company: Company) => {
    if (isSuperAdmin) {
      router.push(`/companies/${company.id}`);
    } else {
      // Regular admin - show their company details
      router.push(`/companies/${company.id}`);
    }
  };

  const handleSwitchCompany = async (companyId: number) => {
    try {
      await switchCompany(companyId);
      Alert.alert('Success', 'Company switched successfully');
      router.push('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to switch company');
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

  // If not super admin and has a company, show company details directly
  if (!isSuperAdmin && currentCompany) {
    return (
      <ScrollView style={styles.container}>
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

  // Super admin view - list all companies
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search companies..."
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
        {filteredCompanies.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <MaterialIcons name="business" size={48} color={Colors.text.tertiary} />
            <ThemedText style={styles.emptyText}>No companies found</ThemedText>
          </Card>
        ) : (
          filteredCompanies.map((company) => (
            <Card key={company.id} variant="elevated" style={styles.companyCard}>
              <TouchableOpacity
                onPress={() => handleCompanyPress(company)}
                activeOpacity={0.7}
              >
                <View style={styles.companyHeader}>
                  <View style={styles.companyInfo}>
                    <ThemedText type="title" style={styles.companyName}>{company.name}</ThemedText>
                    {company.status && (
                      <View style={[styles.statusBadge, { backgroundColor: company.status === 'active' ? Colors.success[500] : Colors.error[500] }]}>
                        <ThemedText style={styles.statusText}>{company.status_display || company.status}</ThemedText>
                      </View>
                    )}
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={Colors.text.tertiary} />
                </View>

                {company.email && (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="email" size={16} color={Colors.text.secondary} />
                    <ThemedText style={styles.detailText}>{company.email}</ThemedText>
                  </View>
                )}

                {company.user_count !== undefined && (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="people" size={16} color={Colors.text.secondary} />
                    <ThemedText style={styles.detailText}>{company.user_count} users</ThemedText>
                  </View>
                )}

                {currentCompany?.id === company.id && (
                  <View style={styles.currentBadge}>
                    <MaterialIcons name="check-circle" size={16} color={Colors.primary[500]} />
                    <ThemedText style={styles.currentText}>Current Company</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
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
  companyCard: {
    margin: Spacing.md,
    padding: Spacing.md,
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
  companyName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '600',
    color: Colors.text.primary,
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
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  currentText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[500],
    fontWeight: '600',
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