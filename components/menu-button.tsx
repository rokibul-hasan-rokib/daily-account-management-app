import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDrawer } from '@/contexts/drawer-context';
import { Colors, Spacing } from '@/constants/design-system';

export function MenuButton() {
  const { openDrawer } = useDrawer();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={openDrawer}
      activeOpacity={0.7}
    >
      <MaterialIcons name="menu" size={24} color={Colors.text.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});
