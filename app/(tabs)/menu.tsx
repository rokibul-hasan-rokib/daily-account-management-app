import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface MenuItem {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Transactions',
    description: 'View and manage all transactions',
    icon: 'list.bullet',
    href: '/transactions',
    color: '#3b82f6',
  },
  {
    title: 'Profit & Loss',
    description: 'See your earnings vs expenses',
    icon: 'chart.line.uptrend.xyaxis',
    href: '/profit-loss',
    color: '#10b981',
  },
  {
    title: 'Bills & Liabilities',
    description: 'Track upcoming payments',
    icon: 'creditcard.fill',
    href: '/bills',
    color: '#ef4444',
  },
  {
    title: 'Item Analytics',
    description: 'Detailed spend tracking per item',
    icon: 'chart.bar.fill',
    href: '/item-analytics',
    color: '#8b5cf6',
  },
];

export default function MenuScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Menu</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Access all features
        </ThemedText>
      </ThemedView>

      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href as any} asChild>
            <TouchableOpacity style={styles.menuCard}>
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <IconSymbol name={item.icon as any} size={32} color="#ffffff" />
              </View>
              <View style={styles.menuContent}>
                <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.menuDescription}>{item.description}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      {/* Info Section */}
      <ThemedView style={styles.infoSection}>
        <ThemedText type="subtitle" style={styles.infoTitle}>About This App</ThemedText>
        <ThemedText style={styles.infoText}>
          This is a simple cash flow and profit/loss tracker designed for individuals and small businesses.
        </ThemedText>
        <ThemedText style={styles.infoText}>
          Currently using dummy data. Backend integration with Django coming soon!
        </ThemedText>
        
        <View style={styles.featuresList}>
          <ThemedText style={styles.featureTitle}>✅ Current Features (MVP):</ThemedText>
          <ThemedText style={styles.featureItem}>• Cash flow dashboard</ThemedText>
          <ThemedText style={styles.featureItem}>• Transaction tracking</ThemedText>
          <ThemedText style={styles.featureItem}>• Profit & Loss analysis</ThemedText>
          <ThemedText style={styles.featureItem}>• Bills & liabilities management</ThemedText>
          <ThemedText style={styles.featureItem}>• Item-level analytics</ThemedText>
        </View>

        <View style={styles.featuresList}>
          <ThemedText style={styles.featureTitle}>🚀 Coming Soon (Phase 2):</ThemedText>
          <ThemedText style={styles.featureItem}>• Receipt scanning (camera upload)</ThemedText>
          <ThemedText style={styles.featureItem}>• Auto-categorization rules</ThemedText>
          <ThemedText style={styles.featureItem}>• Smart alerts & notifications</ThemedText>
          <ThemedText style={styles.featureItem}>• Recurring transactions</ThemedText>
          <ThemedText style={styles.featureItem}>• Export to spreadsheet</ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  menuGrid: {
    paddingHorizontal: 20,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoSection: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  infoTitle: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
  },
  featuresList: {
    marginTop: 16,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
    marginLeft: 8,
  },
});
