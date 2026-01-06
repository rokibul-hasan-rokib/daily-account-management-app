import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-system';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', size = 'sm', style }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        styles[variant],
        styles[size],
        style,
      ]}
    >
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  
  // Variants
  default: {
    backgroundColor: Colors.gray[100],
  },
  success: {
    backgroundColor: Colors.success.light,
  },
  error: {
    backgroundColor: Colors.error.light,
  },
  warning: {
    backgroundColor: Colors.warning.light,
  },
  info: {
    backgroundColor: Colors.info.light,
  },
  
  // Sizes
  sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  
  // Text
  text: {
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  defaultText: {
    color: Colors.gray[700],
  },
  successText: {
    color: Colors.success.dark,
  },
  errorText: {
    color: Colors.error.dark,
  },
  warningText: {
    color: Colors.warning.dark,
  },
  infoText: {
    color: Colors.info.dark,
  },
  
  smText: {
    fontSize: Typography.fontSize.xs,
  },
  mdText: {
    fontSize: Typography.fontSize.sm,
  },
});
