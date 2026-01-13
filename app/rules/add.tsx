import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MenuButton } from '@/components/menu-button';
import { Colors, Typography, Spacing } from '@/constants/design-system';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRules } from '@/contexts/rules-context';
import { useCategories } from '@/contexts/categories-context';
import { useMerchants } from '@/contexts/merchants-context';
import { RulesService } from '@/services/api';

type RuleType = 'merchant' | 'keyword';

export default function AddRuleScreen() {
  const params = useLocalSearchParams();
  const isEditMode = !!params.id;
  const { createRule, updateRule } = useRules();
  const { categories } = useCategories();
  const { merchants } = useMerchants();
  
  const [ruleType, setRuleType] = useState<RuleType>('merchant');
  const [merchant, setMerchant] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<number | undefined>(undefined);
  const [priority, setPriority] = useState('10');
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);

  // Load rule data if editing
  useFocusEffect(
    useCallback(() => {
      if (isEditMode && params.id) {
        loadRuleData();
      }
    }, [isEditMode, params.id])
  );

  const loadRuleData = async () => {
    try {
      setIsLoadingData(true);
      const ruleId = parseInt(params.id as string);
      const rule = await RulesService.getRuleById(ruleId);
      
      if (rule.merchant) {
        setRuleType('merchant');
        setMerchant(rule.merchant);
      } else if (rule.keyword) {
        setRuleType('keyword');
        setKeyword(rule.keyword);
      }
      setCategory(rule.category);
      setPriority(rule.priority.toString());
    } catch (error: any) {
      console.error('Error loading rule:', error);
      Alert.alert('Error', 'Failed to load rule data.');
      router.back();
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!category) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }

    if (ruleType === 'merchant' && !merchant) {
      Alert.alert('Validation Error', 'Please select a merchant');
      return;
    }

    if (ruleType === 'keyword' && !keyword.trim()) {
      Alert.alert('Validation Error', 'Please enter a keyword');
      return;
    }

    const priorityNum = parseInt(priority) || 10;
    if (priorityNum < 1 || priorityNum > 100) {
      Alert.alert('Validation Error', 'Priority must be between 1 and 100');
      return;
    }

    try {
      setLoading(true);
      const ruleData: any = {
        category,
        priority: priorityNum,
      };

      if (ruleType === 'merchant') {
        ruleData.merchant = merchant;
      } else {
        ruleData.keyword = keyword.trim();
      }

      if (isEditMode && params.id) {
        await updateRule(parseInt(params.id.toString()), ruleData);
        Alert.alert('Success', 'Rule updated successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await createRule(ruleData);
        Alert.alert('Success', 'Rule created successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      console.error('Error saving rule:', error);
      Alert.alert('Error', error.message || 'Failed to save rule');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <ThemedText style={styles.loadingText}>Loading rule data...</ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MenuButton />
            <View>
              <ThemedText type="title" style={styles.headerTitle}>
                {isEditMode ? 'Edit Rule' : 'Add Rule'}
              </ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {isEditMode ? 'Update categorization rule' : 'Create a new categorization rule'}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <Card variant="elevated" style={styles.formCard}>
          {/* Rule Type Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Rule Type</ThemedText>
            <View style={styles.ruleTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.ruleTypeButton,
                  ruleType === 'merchant' && styles.ruleTypeButtonActive,
                ]}
                onPress={() => {
                  setRuleType('merchant');
                  setKeyword('');
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name="store" 
                  size={20} 
                  color={ruleType === 'merchant' ? Colors.text.inverse : Colors.text.secondary} 
                />
                <ThemedText style={[
                  styles.ruleTypeButtonText,
                  ruleType === 'merchant' && styles.ruleTypeButtonTextActive,
                ]}>
                  Merchant
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ruleTypeButton,
                  ruleType === 'keyword' && styles.ruleTypeButtonActive,
                ]}
                onPress={() => {
                  setRuleType('keyword');
                  setMerchant(undefined);
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name="search" 
                  size={20} 
                  color={ruleType === 'keyword' ? Colors.text.inverse : Colors.text.secondary} 
                />
                <ThemedText style={[
                  styles.ruleTypeButtonText,
                  ruleType === 'keyword' && styles.ruleTypeButtonTextActive,
                ]}>
                  Keyword
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Merchant Selection */}
          {ruleType === 'merchant' && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>Merchant</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.merchantScroll}>
                {merchants.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.merchantButton,
                      merchant === m.id && styles.merchantButtonActive,
                    ]}
                    onPress={() => setMerchant(m.id)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={[
                      styles.merchantButtonText,
                      merchant === m.id && styles.merchantButtonTextActive,
                    ]}>
                      {m.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {merchants.length === 0 && (
                <ThemedText style={styles.emptyText}>
                  No merchants available. Create a merchant first.
                </ThemedText>
              )}
            </View>
          )}

          {/* Keyword Input */}
          {ruleType === 'keyword' && (
            <Input
              label="Keyword"
              value={keyword}
              onChangeText={setKeyword}
              placeholder="e.g., groceries, transport, utilities"
              leftIcon={<MaterialIcons name="search" size={20} color={Colors.primary[500]} />}
            />
          )}

          {/* Category Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Category</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[
                    styles.categoryButtonText,
                    category === cat.id && styles.categoryButtonTextActive,
                  ]}>
                    {cat.icon} {cat.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {categories.length === 0 && (
              <ThemedText style={styles.emptyText}>
                No categories available. Create a category first.
              </ThemedText>
            )}
          </View>

          {/* Priority Input */}
          <Input
            label="Priority (1-100)"
            value={priority}
            onChangeText={setPriority}
            placeholder="10"
            keyboardType="numeric"
            leftIcon={<MaterialIcons name="priority-high" size={20} color={Colors.primary[500]} />}
          />
          <ThemedText style={styles.helpText}>
            Higher priority rules are applied first. Default is 10.
          </ThemedText>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => router.back()}
            style={styles.cancelButton}
            disabled={loading}
          />
          <Button
            title={loading ? 'Saving...' : isEditMode ? 'Update Rule' : 'Create Rule'}
            variant="primary"
            onPress={handleSave}
            style={styles.saveButton}
            disabled={loading || !category || (ruleType === 'merchant' && !merchant) || (ruleType === 'keyword' && !keyword.trim())}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  formCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  ruleTypeContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  ruleTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  ruleTypeButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  ruleTypeButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  ruleTypeButtonTextActive: {
    color: Colors.text.inverse,
  },
  merchantScroll: {
    marginTop: Spacing.xs,
  },
  merchantButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginRight: Spacing.sm,
  },
  merchantButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  merchantButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  merchantButtonTextActive: {
    color: Colors.text.inverse,
  },
  categoryScroll: {
    marginTop: Spacing.xs,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginRight: Spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  categoryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  categoryButtonTextActive: {
    color: Colors.text.inverse,
  },
  helpText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
