import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, ActivityIndicator, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRules } from '@/contexts/rules-context';
import { router, useFocusEffect } from 'expo-router';
import { CategoryRule } from '@/services/api/types';

export default function RulesScreen() {
  const { rules, isLoading, deleteRule, refreshRules } = useRules();

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshRules({ ordering: 'priority' });
    }, [refreshRules])
  );

  // Sort rules by priority (higher priority first)
  const sortedRules = useMemo(() => {
    return [...rules].sort((a, b) => b.priority - a.priority);
  }, [rules]);

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Delete Rule',
      'Are you sure you want to delete this rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRule(id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete rule.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MenuButton />
          <View>
            <ThemedText type="title" style={styles.headerTitle}>Rules</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Automate transaction categorization
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/rules/add')}
        >
          <MaterialIcons name="add" size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <Card variant="outlined" style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <MaterialIcons name="lightbulb" size={20} color={Colors.warning.main} />
          <ThemedText style={styles.infoText}>
            Rules automatically categorize transactions based on merchant names or patterns.
          </ThemedText>
        </View>
      </Card>

      {/* Rules List */}
      <View style={styles.rulesList}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <ThemedText style={styles.loadingText}>Loading rules...</ThemedText>
          </View>
        ) : (
          <>
            {sortedRules.map((rule) => (
              <Card key={rule.id} variant="elevated" style={styles.ruleCard}>
                <View style={styles.ruleHeader}>
                  <TouchableOpacity
                    style={styles.ruleInfo}
                    onPress={() => router.push(`/rules/add?id=${rule.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.ruleTitleRow}>
                      <ThemedText style={styles.ruleName}>
                        {rule.merchant_name || `Keyword: "${rule.keyword}"`}
                      </ThemedText>
                      <Badge 
                        label={`Priority: ${rule.priority}`} 
                        variant="default" 
                        size="sm" 
                      />
                    </View>
                    <View style={styles.ruleMeta}>
                      {rule.merchant_name && (
                        <View style={styles.ruleMetaItem}>
                          <MaterialIcons name="store" size={14} color={Colors.text.secondary} />
                          <Text style={styles.rulePattern}>{rule.merchant_name}</Text>
                        </View>
                      )}
                      {rule.keyword && (
                        <View style={styles.ruleMetaItem}>
                          <MaterialIcons name="search" size={14} color={Colors.text.secondary} />
                          <Text style={styles.rulePattern}>"{rule.keyword}"</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(rule.id)}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons name="delete-outline" size={20} color={Colors.error.main} />
                  </TouchableOpacity>
                </View>
                <View style={styles.ruleFooter}>
                  <Badge 
                    label={rule.category_name || 'Uncategorized'} 
                    variant="info" 
                    size="sm" 
                  />
                  {rule.times_applied !== undefined && (
                    <Text style={styles.ruleCount}>
                      {rule.times_applied} time{rule.times_applied !== 1 ? 's' : ''} applied
                    </Text>
                  )}
                </View>
              </Card>
            ))}

            {sortedRules.length === 0 && !isLoading && (
              <View style={styles.emptyState}>
                <MaterialIcons name="rule" size={64} color={Colors.text.tertiary} />
                <ThemedText style={styles.emptyTitle}>No rules found</ThemedText>
                <ThemedText style={styles.emptyText}>
                  Create your first rule to automate transaction categorization
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.warning.light,
    borderColor: Colors.warning.main,
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
  addFormCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  formTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },
  addFormButton: {
    width: '100%',
  },
  rulesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  ruleCard: {
    padding: Spacing.md,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  ruleInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  ruleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  ruleName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
  },
  ruleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  ruleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rulePattern: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  ruleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ruleCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
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
