import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, usePathname } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface NavItem {
  title: string;
  icon: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    icon: 'dashboard',
    href: '/(tabs)',
  },
  {
    title: 'Transactions',
    icon: 'receipt',
    href: '/transactions',
  },
  {
    title: 'Profit & Loss',
    icon: 'trending-up',
    href: '/profit-loss',
  },
  {
    title: 'Bills & Liabilities',
    icon: 'account-balance',
    href: '/bills',
  },
  {
    title: 'Item Analytics',
    icon: 'bar-chart',
    href: '/item-analytics',
  },
  {
    title: 'Scan Receipt',
    icon: 'camera-alt',
    href: '/scan-receipt',
  },
  {
    title: 'Categories',
    icon: 'local-offer',
    href: '/categories',
  },
  {
    title: 'Merchants',
    icon: 'store',
    href: '/merchants',
  },
  {
    title: 'Rules',
    icon: 'gavel',
    href: '/rules',
  },
  {
    title: 'Alerts',
    icon: 'notifications',
    href: '/alerts',
  },
  {
    title: 'Summaries',
    icon: 'description',
    href: '/summaries',
  },
  {
    title: 'Settings',
    icon: 'settings',
    href: '/settings',
  },
];

export function SidebarNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/(tabs)') {
      // Dashboard is active when on index or root
      return (
        pathname === '/' ||
        pathname === '/(tabs)' ||
        pathname === '/(tabs)/' ||
        pathname === '/(tabs)/index' ||
        (pathname.startsWith('/(tabs)/') && 
         !pathname.includes('/menu') && 
         !pathname.includes('/explore'))
      );
    }
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {/* Logo with colorful abstract design */}
          <View style={styles.logo}>
            <View style={styles.logoGradient}>
              <View style={[styles.logoCircle, styles.logoCircle1]} />
              <View style={[styles.logoCircle, styles.logoCircle2]} />
              <View style={[styles.logoCircle, styles.logoCircle3]} />
            </View>
          </View>
        </View>
        <Text style={styles.appTitle}>Daily Account</Text>
      </View>

      {/* Section Title */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>FINANCE MANAGEMENT</Text>
      </View>

      {/* Navigation Items */}
      <ScrollView style={styles.navContainer} showsVerticalScrollIndicator={false}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          
          return (
            <Link key={item.title} href={item.href as any} asChild>
              <TouchableOpacity
                style={[styles.navItem, active && styles.navItemActive]}
                activeOpacity={0.7}
              >
                <View style={styles.navItemContent}>
                  <MaterialIcons
                    name={item.icon as any}
                    size={24}
                    color="#FFFFFF"
                    style={styles.icon}
                  />
                  <Text style={[styles.navItemText, active && styles.navItemTextActive]}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            </Link>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B2E83', // Dark purple background
    width: '100%',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 12,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: '#5A3A93',
    borderRadius: 30,
    position: 'relative',
  },
  logoCircle: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    opacity: 0.9,
  },
  logoCircle1: {
    backgroundColor: '#4A90E2',
    top: -8,
    left: -8,
  },
  logoCircle2: {
    backgroundColor: '#50C878',
    top: 8,
    right: -8,
  },
  logoCircle3: {
    backgroundColor: '#FF6B9D',
    bottom: -8,
    left: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B8A9D9',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  navContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: '#6B4FA3', // Lighter purple for selected item
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 16,
  },
  navItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  navItemTextActive: {
    fontWeight: '600',
  },
});
