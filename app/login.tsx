import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/design-system';
import { useAuth } from '@/contexts/auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('LoginScreen: Attempting login with username:', username.trim());
      await login(username.trim(), password);
      console.log('LoginScreen: Login successful');
      
      // Wait a moment for state to update, then navigate
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('LoginScreen: Navigating to dashboard...');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('LoginScreen: Login error:', error);
      console.error('LoginScreen: Error details:', JSON.stringify(error, null, 2));
      
      // Extract error message
      let errorMessage = 'Login failed. Please try again.';
      
      // Check if it's a network error
      if (error?.message?.includes('Network error') || error?.message?.includes('Network') || error?.message?.includes('Cannot connect')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection and ensure the Django server is running on http://192.168.0.193:5000';
      } else if (error?.message?.includes('ALLOWED_HOSTS')) {
        // Django ALLOWED_HOSTS configuration error
        errorMessage = error.message;
      } else if (error?.response?.status === 401) {
        errorMessage = 'Invalid username or password. Please check your credentials.';
      } else if (error?.response?.status === 400) {
        // Check if it's an HTML error response (Django debug page)
        const responseData = error?.response?.data;
        if (typeof responseData === 'string' && responseData.includes('ALLOWED_HOSTS')) {
          errorMessage = error?.message || 'Django server configuration error: Please add your IP address to ALLOWED_HOSTS in Django settings.py';
        } else {
          errorMessage = error?.message || error?.response?.data?.error || error?.response?.data?.detail || 'Invalid request. Please check your input.';
        }
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.response?.data) {
        const data = error.response.data;
        errorMessage = data.error || data.detail || data.message || errorMessage;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo and Header */}
          <View style={styles.header}>
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
            <Text style={styles.subtitle}>Welcome back! Please login to continue</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors({ ...errors, username: undefined });
              }}
              error={errors.username}
              autoCapitalize="none"
              autoComplete="username"
              leftIcon={
                <MaterialIcons name="person" size={20} color={Colors.primary[500]} />
              }
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              leftIcon={
                <MaterialIcons name="lock" size={20} color={Colors.primary[500]} />
              }
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={Colors.text.tertiary}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => Alert.alert('Forgot Password', 'Feature coming soon!')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Login"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              disabled={isLoading}
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <Button
              title="Continue with Google"
              onPress={() => Alert.alert('Google Login', 'Feature coming soon!')}
              variant="outline"
              size="lg"
              style={styles.socialButton}
            />

            <Button
              title="Continue with Apple"
              onPress={() => Alert.alert('Apple Login', 'Feature coming soon!')}
              variant="outline"
              size="lg"
              style={styles.socialButton}
            />
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('./register' as any)}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: 40,
    position: 'relative',
  },
  logoCircle: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[700],
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    marginBottom: Spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.medium,
  },
  loginButton: {
    marginBottom: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.medium,
  },
  socialButton: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  footerLink: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.semibold,
  },
});
