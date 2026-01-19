import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Modal,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDrawer } from '@/contexts/drawer-context';
import { useCompany } from '@/contexts/company-context';
import { CompanySwitcher } from './company-switcher';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 320);

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

export function DrawerSidebar() {
  const { isOpen, closeDrawer } = useDrawer();
  const { isSuperAdmin } = useCompany();
  const pathname = usePathname();
  const router = useRouter();
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === '/(tabs)') {
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

  const handleNavigation = (href: string) => {
    router.push(href as any);
    closeDrawer();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={closeDrawer} />

        {/* Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
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
            <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Company Switcher (Super Admin only) */}
          {isSuperAdmin && (
            <View style={styles.companySwitcherContainer}>
              <CompanySwitcher onCompanySwitch={closeDrawer} />
            </View>
          )}

          {/* Section Title */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>FINANCE MANAGEMENT</Text>
          </View>

          {/* Navigation Items */}
          <ScrollView style={styles.navContainer} showsVerticalScrollIndicator={false}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              
              return (
                <TouchableOpacity
                  key={item.title}
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => handleNavigation(item.href)}
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
              );
            })}
            
            {/* Companies Menu Item (Super Admin only) */}
            {isSuperAdmin && (
              <TouchableOpacity
                style={[styles.navItem, isActive('/companies') && styles.navItemActive]}
                onPress={() => handleNavigation('/companies')}
                activeOpacity={0.7}
              >
                <View style={styles.navItemContent}>
                  <MaterialIcons
                    name="business"
                    size={24}
                    color="#FFFFFF"
                    style={styles.icon}
                  />
                  <Text style={[styles.navItemText, isActive('/companies') && styles.navItemTextActive]}>
                    Companies
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#4B2E83',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoContainer: {
    marginRight: 0,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    position: 'relative',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: '#5A3A93',
    borderRadius: 25,
    position: 'relative',
  },
  logoCircle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.9,
  },
  logoCircle1: {
    backgroundColor: '#4A90E2',
    top: -6,
    left: -6,
  },
  logoCircle2: {
    backgroundColor: '#50C878',
    top: 6,
    right: -6,
  },
  logoCircle3: {
    backgroundColor: '#FF6B9D',
    bottom: -6,
    left: 6,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companySwitcherContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    marginTop: 8,
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
    backgroundColor: '#6B4FA3',
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
