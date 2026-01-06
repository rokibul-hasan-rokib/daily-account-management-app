import { Link, usePathname } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface SubMenuItem {
  title: string;
  href: string;
  icon?: string;
}

interface NavItem {
  title: string;
  icon: string;
  href: string;
  hasSubmenu?: boolean;
  submenuItems?: SubMenuItem[];
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
    hasSubmenu: true,
    submenuItems: [
      { title: 'Add Transaction', href: '/transactions/add', icon: 'add-circle' },
      { title: 'View All', href: '/transactions', icon: 'list' },
    ],
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
    hasSubmenu: true,
    submenuItems: [
      { title: 'View Analytics', href: '/item-analytics', icon: 'bar-chart' },
      { title: 'Top Items', href: '/item-analytics?filter=top', icon: 'trending-up' },
      { title: 'Trends', href: '/item-analytics?filter=trends', icon: 'show-chart' },
    ],
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
    hasSubmenu: true,
    submenuItems: [
      { title: 'Add Category', href: '/categories?action=add', icon: 'add-circle' },
      { title: 'View All', href: '/categories', icon: 'list' },
    ],
  },
  {
    title: 'Merchants',
    icon: 'store',
    href: '/merchants',
    hasSubmenu: true,
    submenuItems: [
      { title: 'Add Merchant', href: '/merchants?action=add', icon: 'add-circle' },
      { title: 'View All', href: '/merchants', icon: 'list' },
    ],
  },
  {
    title: 'Rules',
    icon: 'gavel',
    href: '/rules',
    hasSubmenu: true,
    submenuItems: [
      { title: 'Add Rule', href: '/rules?action=add', icon: 'add-circle' },
      { title: 'View All', href: '/rules', icon: 'list' },
    ],
  },
  {
    title: 'Others',
    icon: 'more-horiz',
    href: '/settings',
    hasSubmenu: true,
    submenuItems: [
      { title: 'Alerts', href: '/alerts', icon: 'notifications' },
      { title: 'Summaries', href: '/summaries', icon: 'description' },
      { title: 'Settings', href: '/settings', icon: 'settings' },
      { title: 'Export Data', href: '/settings?tab=export', icon: 'file-download' },
      { title: 'Backup & Restore', href: '/settings?tab=backup', icon: 'cloud-upload' },
    ],
  },
];

export function SidebarNavigation() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

  const toggleExpand = (title: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedItems(newExpanded);
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
            <View key={item.title}>
              <Link href={item.href as any} asChild>
                <TouchableOpacity
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => {
                    if (item.hasSubmenu) {
                      toggleExpand(item.title);
                    }
                  }}>
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
                  {item.hasSubmenu && (
                    <MaterialIcons
                      name="chevron-left"
                      size={20}
                      color="#FFFFFF"
                      style={styles.chevron}
                    />
                  )}
                </TouchableOpacity>
              </Link>
              
              {/* Submenu */}
              {item.hasSubmenu && expandedItems.has(item.title) && item.submenuItems && (
                <View style={styles.submenu}>
                  {item.submenuItems.map((subItem) => {
                    const subActive = pathname === subItem.href || pathname.startsWith(subItem.href);
                    return (
                      <Link key={subItem.href} href={subItem.href as any} asChild>
                        <TouchableOpacity
                          style={[styles.submenuItem, subActive && styles.submenuItemActive]}
                        >
                          {subItem.icon && (
                            <MaterialIcons
                              name={subItem.icon as any}
                              size={18}
                              color={subActive ? '#FFFFFF' : '#B8A9D9'}
                              style={styles.submenuIcon}
                            />
                          )}
                          <Text style={[
                            styles.submenuText,
                            subActive && styles.submenuTextActive
                          ]}>
                            {subItem.title}
                          </Text>
                        </TouchableOpacity>
                      </Link>
                    );
                  })}
                </View>
              )}
            </View>
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
  chevron: {
    marginLeft: 8,
    opacity: 0.7,
  },
  submenu: {
    paddingLeft: 40,
    paddingVertical: 8,
    gap: 4,
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 6,
  },
  submenuItemActive: {
    backgroundColor: '#5A3A93',
  },
  submenuIcon: {
    marginRight: 12,
  },
  submenuText: {
    fontSize: 14,
    color: '#B8A9D9',
    fontWeight: '400',
  },
  submenuTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
