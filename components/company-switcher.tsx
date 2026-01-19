/**
 * Company Switcher Component
 * Allows super admin to switch between companies
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from './themed-text';
import { Card } from './ui/card';
import { Colors, Spacing, Typography } from '@/constants/design-system';
import { useCompany } from '@/contexts/company-context';
import { Company } from '@/services/api/types';

interface CompanySwitcherProps {
  onCompanySwitch?: () => void;
}

export function CompanySwitcher({ onCompanySwitch }: CompanySwitcherProps) {
  const { companies, currentCompany, isLoading, isSuperAdmin, switchCompany } = useCompany();
  const [modalVisible, setModalVisible] = useState(false);
  const [switching, setSwitching] = useState(false);

  if (!isSuperAdmin || companies.length <= 1) {
    return null; // Don't show switcher if not super admin or only one company
  }

  const handleSwitch = async (companyId: number) => {
    try {
      setSwitching(true);
      await switchCompany(companyId);
      setModalVisible(false);
      onCompanySwitch?.();
    } catch (error: any) {
      console.error('Error switching company:', error);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.switcherButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.switcherContent}>
          <MaterialIcons name="business" size={20} color={Colors.primary[500]} />
          <View style={styles.switcherText}>
            <ThemedText style={styles.switcherLabel}>Company</ThemedText>
            <ThemedText style={styles.switcherValue} numberOfLines={1}>
              {currentCompany?.name || 'Select Company'}
            </ThemedText>
          </View>
          <MaterialIcons name="arrow-drop-down" size={20} color={Colors.text.secondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>Switch Company</ThemedText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary[500]} />
              </View>
            ) : (
              <ScrollView style={styles.companiesList}>
                {companies.map((company) => (
                  <TouchableOpacity
                    key={company.id}
                    style={[
                      styles.companyItem,
                      currentCompany?.id === company.id && styles.companyItemActive,
                    ]}
                    onPress={() => handleSwitch(company.id)}
                    disabled={switching || currentCompany?.id === company.id}
                  >
                    <View style={styles.companyItemContent}>
                      <View style={styles.companyItemInfo}>
                        <ThemedText style={styles.companyItemName}>{company.name}</ThemedText>
                        {company.email && (
                          <ThemedText style={styles.companyItemEmail}>{company.email}</ThemedText>
                        )}
                      </View>
                      {currentCompany?.id === company.id && (
                        <MaterialIcons name="check-circle" size={24} color={Colors.primary[500]} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  switcherButton: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  switcherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  switcherText: {
    flex: 1,
  },
  switcherLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  switcherValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.light,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  companiesList: {
    maxHeight: 400,
  },
  companyItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  companyItemActive: {
    backgroundColor: Colors.primary[50],
  },
  companyItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyItemInfo: {
    flex: 1,
  },
  companyItemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  companyItemEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
});