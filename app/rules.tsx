import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing, Shadows } from '@/constants/design-system';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Switch } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Rule {
  id: string;
  name: string;
  merchantPattern: string;
  category: string;
  enabled: boolean;
  transactionCount: number;
}

const dummyRules: Rule[] = [
  { id: '1', name: 'Tesco Auto-Categorize', merchantPattern: 'Tesco', category: 'Groceries', enabled: true, transactionCount: 25 },
  { id: '2', name: 'Uber Transport Rule', merchantPattern: 'Uber', category: 'Transport', enabled: true, transactionCount: 32 },
  { id: '3', name: 'Amazon Shopping', merchantPattern: 'Amazon', category: 'Shopping', enabled: false, transactionCount: 18 },
];

const categoryOptions = [
  { label: 'Groceries', value: 'groceries' },
  { label: 'Transport', value: 'transport' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Food & Drink', value: 'food-drink' },
];

export default function RulesScreen() {
  const [rules] = useState<Rule[]>(dummyRules);
  const [isAdding, setIsAdding] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('');

  const toggleRule = (id: string) => {
    console.log('Toggling rule:', id);
  };

  const handleAddRule = () => {
    if (newRuleName.trim() && newRulePattern.trim() && newRuleCategory) {
      console.log('Adding rule:', { name: newRuleName, pattern: newRulePattern, category: newRuleCategory });
      setNewRuleName('');
      setNewRulePattern('');
      setNewRuleCategory('');
      setIsAdding(false);
    }
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
          onPress={() => setIsAdding(!isAdding)}
        >
          <MaterialIcons name={isAdding ? "close" : "add"} size={24} color={Colors.text.inverse} />
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

      {/* Add Rule Form */}
      {isAdding && (
        <Card variant="elevated" style={styles.addFormCard}>
          <ThemedText type="subtitle" style={styles.formTitle}>Create New Rule</ThemedText>
          <Input
            label="Rule Name"
            placeholder="e.g., Tesco Auto-Categorize"
            value={newRuleName}
            onChangeText={setNewRuleName}
          />
          <Input
            label="Merchant Pattern"
            placeholder="e.g., Tesco, Uber, Amazon"
            value={newRulePattern}
            onChangeText={setNewRulePattern}
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={newRuleCategory}
            onValueChange={setNewRuleCategory}
            placeholder="Select category"
          />
          <Button
            title="Create Rule"
            variant="primary"
            onPress={handleAddRule}
            style={styles.addFormButton}
          />
        </Card>
      )}

      {/* Rules List */}
      <View style={styles.rulesList}>
        {rules.map((rule) => (
          <Card key={rule.id} variant="elevated" style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <View style={styles.ruleInfo}>
                <ThemedText style={styles.ruleName}>{rule.name}</ThemedText>
                <View style={styles.ruleMeta}>
                  <Text style={styles.rulePattern}>Pattern: "{rule.merchantPattern}"</Text>
                </View>
              </View>
              <Switch
                value={rule.enabled}
                onValueChange={() => toggleRule(rule.id)}
                trackColor={{ false: Colors.gray[300], true: Colors.primary[500] }}
                thumbColor={Colors.background.light}
              />
            </View>
            <View style={styles.ruleFooter}>
              <Badge label={rule.category} variant="info" size="sm" />
              <Text style={styles.ruleCount}>
                {rule.transactionCount} transaction{rule.transactionCount !== 1 ? 's' : ''} matched
              </Text>
            </View>
          </Card>
        ))}
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
  ruleName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  ruleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rulePattern: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
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
});
