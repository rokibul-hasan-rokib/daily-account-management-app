import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type TransactionType = 'income' | 'expense';

const categories = {
  income: ['salary', 'freelance', 'sales', 'other-income'],
  expense: ['groceries', 'transport', 'utilities', 'rent', 'raw-materials', 'equipment', 'marketing', 'other-expense']
};

export default function AddTransactionScreen() {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [merchantName, setMerchant] = useState('');

  const handleSave = () => {
    // In real app, this would save to backend/state
    console.log({ type, amount, description, category, merchantName });
    router.back();
  };

  const categoryList = categories[type];

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
        </TouchableOpacity>
        <ThemedText type="subtitle">Add Transaction</ThemedText>
        <TouchableOpacity onPress={handleSave}>
          <ThemedText style={styles.saveButton}>Save</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Type Toggle */}
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
          onPress={() => setType('income')}
        >
          <ThemedText style={[
            styles.typeButtonText,
            type === 'income' && styles.typeButtonTextActive
          ]}>
            Income
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
          onPress={() => setType('expense')}
        >
          <ThemedText style={[
            styles.typeButtonText,
            type === 'expense' && styles.typeButtonTextActive
          ]}>
            Expense
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View style={styles.formSection}>
        <ThemedText style={styles.label}>Amount</ThemedText>
        <View style={styles.amountInputContainer}>
          <ThemedText style={styles.currencySymbol}>£</ThemedText>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
      </View>

      {/* Description */}
      <View style={styles.formSection}>
        <ThemedText style={styles.label}>Description</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="What is this for?"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Category */}
      <View style={styles.formSection}>
        <ThemedText style={styles.label}>Category</ThemedText>
        <View style={styles.categoryGrid}>
          {categoryList.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive
              ]}
              onPress={() => setCategory(cat)}
            >
              <ThemedText style={[
                styles.categoryChipText,
                category === cat && styles.categoryChipTextActive
              ]}>
                {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Merchant */}
      <View style={styles.formSection}>
        <ThemedText style={styles.label}>Merchant (optional)</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="e.g., Tesco, Uber"
          value={merchantName}
          onChangeText={setMerchant}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  cancelButton: {
    color: '#64748b',
    fontSize: 16,
  },
  saveButton: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  typeToggle: {
    flexDirection: 'row',
    margin: 20,
    padding: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: '#1e293b',
  },
  formSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    paddingVertical: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
});
