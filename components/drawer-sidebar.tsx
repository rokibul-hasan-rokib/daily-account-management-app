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
];

const companyNavItems: NavItem[] = [
  {
    title: 'Company',
    icon: 'business',
    href: '/companies',
  },
  {
    title: 'Company Users',
    icon: 'people',
    href: '/companies/users',
  },
  {
    title: 'Company Roles',
    icon: 'admin-panel-settings',
    href: '/companies/roles',
  },
];

const settingsNavItems: NavItem[] = [
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

          {/* Navigation Items */}
          <ScrollView 
            style={styles.navContainer} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.navContent}
          >
            {/* Finance Management Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>FINANCE MANAGEMENT</Text>
            </View>
            
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
                    <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
                      <MaterialIcons
                        name={item.icon as any}
                        size={22}
                        color={active ? '#FFFFFF' : '#D1C4E9'}
                        style={styles.icon}
                      />
                    </View>
                    <Text style={[styles.navItemText, active && styles.navItemTextActive]}>
                      {item.title}
                    </Text>
                  </View>
                  {active && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            })}

            {/* Company Management Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>COMPANY MANAGEMENT</Text>
            </View>
            
            {companyNavItems.map((item) => {
              const active = isActive(item.href);
              
              return (
                <TouchableOpacity
                  key={item.title}
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => handleNavigation(item.href)}
                  activeOpacity={0.7}
                >
                  <View style={styles.navItemContent}>
                    <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
                      <MaterialIcons
                        name={item.icon as any}
                        size={22}
                        color={active ? '#FFFFFF' : '#D1C4E9'}
                        style={styles.icon}
                      />
                    </View>
                    <Text style={[styles.navItemText, active && styles.navItemTextActive]}>
                      {item.title}
                    </Text>
                  </View>
                  {active && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            })}

            {/* Settings Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>SETTINGS</Text>
            </View>
            
            {settingsNavItems.map((item) => {
              const active = isActive(item.href);
              
              return (
                <TouchableOpacity
                  key={item.title}
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => handleNavigation(item.href)}
                  activeOpacity={0.7}
                >
                  <View style={styles.navItemContent}>
                    <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
                      <MaterialIcons
                        name={item.icon as any}
                        size={22}
                        color={active ? '#FFFFFF' : '#D1C4E9'}
                        style={styles.icon}
                      />
                    </View>
                    <Text style={[styles.navItemText, active && styles.navItemTextActive]}>
                      {item.title}
                    </Text>
                  </View>
                  {active && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            })}
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
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  companySwitcherContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 8,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B8A9D9',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  navContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  navContent: {
    paddingBottom: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 3,
    marginHorizontal: 4,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  navItemActive: {
    backgroundColor: '#6B4FA3',
    shadowColor: '#8B6FC7',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  icon: {
    // Icon styling handled in component
  },
  navItemText: {
    fontSize: 15,
    color: '#E8E0F5',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  navItemTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
});
