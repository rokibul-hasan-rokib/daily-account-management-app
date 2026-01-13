import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DrawerProvider } from '@/contexts/drawer-context';
import { AuthProvider } from '@/contexts/auth-context';
import { CategoriesProvider } from '@/contexts/categories-context';
import { MerchantsProvider } from '@/contexts/merchants-context';
import { TransactionsProvider } from '@/contexts/transactions-context';
import { ReceiptsProvider } from '@/contexts/receipts-context';
import { DrawerSidebar } from '@/components/drawer-sidebar';

export const unstable_settings = {
  initialRouteName: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <CategoriesProvider>
        <MerchantsProvider>
          <TransactionsProvider>
            <ReceiptsProvider>
              <DrawerProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="splash" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <DrawerSidebar />
            <StatusBar style="light" />
          </ThemeProvider>
        </DrawerProvider>
            </ReceiptsProvider>
        </TransactionsProvider>
        </MerchantsProvider>
      </CategoriesProvider>
    </AuthProvider>
  );
}
