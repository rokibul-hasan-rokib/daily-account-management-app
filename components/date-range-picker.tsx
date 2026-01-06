import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/design-system';

interface DateRangePickerProps {
  onDateRangeSelect: (start: Date, end: Date) => void;
  onClose: () => void;
}

export function DateRangePicker({ onDateRangeSelect, onClose }: DateRangePickerProps) {
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onDateRangeSelect(start, end);
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.quickSelect}>
              <Text style={styles.sectionTitle}>Quick Select</Text>
              <View style={styles.quickButtons}>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => handleQuickSelect(7)}
                >
                  <Text style={styles.quickButtonText}>Last 7 days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => handleQuickSelect(30)}
                >
                  <Text style={styles.quickButtonText}>Last 30 days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => handleQuickSelect(90)}
                >
                  <Text style={styles.quickButtonText}>Last 90 days</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.customSelect}>
              <Text style={styles.sectionTitle}>Custom Range</Text>
              <Text style={styles.infoText}>
                Custom date picker coming soon. Use quick select for now.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '60%',
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
  quickSelect: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  quickButtons: {
    gap: Spacing.sm,
  },
  quickButton: {
    padding: Spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  quickButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary[700],
    fontWeight: Typography.fontWeight.medium,
  },
  customSelect: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
});
