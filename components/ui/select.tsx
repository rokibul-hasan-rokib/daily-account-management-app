import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/design-system';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.select, error && styles.selectError]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectText, !selectedOption && styles.placeholder]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.text.secondary} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={isOpen} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select'}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <MaterialIcons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.option, value === option.value && styles.optionSelected]}
                  onPress={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, value === option.value && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <MaterialIcons name="check" size={20} color={Colors.primary[600]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.light,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  selectError: {
    borderColor: Colors.error.main,
  },
  selectText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    flex: 1,
  },
  placeholder: {
    color: Colors.text.tertiary,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error.main,
    marginTop: Spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  optionSelected: {
    backgroundColor: Colors.primary[50],
  },
  optionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  optionTextSelected: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
});
