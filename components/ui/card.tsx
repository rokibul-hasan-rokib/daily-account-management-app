import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/design-system';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof Spacing;
}

export function Card({ 
  children, 
  style, 
  variant = 'default',
  padding = 'md' 
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        { padding: Spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
  },
  elevated: {
    ...Shadows.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
});
