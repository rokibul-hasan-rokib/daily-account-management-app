import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppSplashScreen } from '@/components/splash-screen';

export default function SplashScreen() {
  const router = useRouter();

  const handleFinish = () => {
    // Navigate to main app after splash screen
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <AppSplashScreen onFinish={handleFinish} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
