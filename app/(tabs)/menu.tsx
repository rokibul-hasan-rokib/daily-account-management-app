import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDrawer } from '@/contexts/drawer-context';

export default function MenuScreen() {
  const { openDrawer } = useDrawer();

  useEffect(() => {
    // Automatically open drawer when menu tab is accessed
    openDrawer();
  }, []);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
