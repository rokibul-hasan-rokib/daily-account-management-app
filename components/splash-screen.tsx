import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface SplashScreenProps {
  onFinish?: () => void;
}

export function AppSplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.4)).current;
  const dot3Anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Keep splash screen visible while we load
    SplashScreen.preventAutoHideAsync();

    // Animate logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoRotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(logoRotateAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // Animate loading dots
    const animateDots = () => {
      const createDotAnimation = (dotAnim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dotAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnim, {
              toValue: 0.4,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
      };

      Animated.parallel([
        createDotAnimation(dot1Anim, 0),
        createDotAnimation(dot2Anim, 200),
        createDotAnimation(dot3Anim, 400),
      ]).start();
    };

    animateDots();

    // Hide splash screen after animation
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
      if (onFinish) {
        onFinish();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScaleAnim },
                { rotate: logoRotation },
              ],
            },
          ]}>
          <View style={styles.logo}>
            <View style={styles.logoGradient}>
              <View style={[styles.logoCircle, styles.logoCircle1]} />
              <View style={[styles.logoCircle, styles.logoCircle2]} />
              <View style={[styles.logoCircle, styles.logoCircle3]} />
            </View>
          </View>
        </Animated.View>

        {/* App Title */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.appTitle}>Daily Account</Text>
          <Text style={styles.tagline}>Finance Management Made Simple</Text>
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
          <View style={styles.loadingDots}>
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot1Anim,
                  transform: [
                    {
                      scale: dot1Anim.interpolate({
                        inputRange: [0.4, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot2Anim,
                  transform: [
                    {
                      scale: dot2Anim.interpolate({
                        inputRange: [0.4, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot3Anim,
                  transform: [
                    {
                      scale: dot3Anim.interpolate({
                        inputRange: [0.4, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B2E83', // Dark purple background
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: '#5A3A93',
    borderRadius: 60,
    position: 'relative',
  },
  logoCircle: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    opacity: 0.9,
  },
  logoCircle1: {
    backgroundColor: '#4A90E2',
    top: -16,
    left: -16,
  },
  logoCircle2: {
    backgroundColor: '#50C878',
    top: 16,
    right: -16,
  },
  logoCircle3: {
    backgroundColor: '#FF6B9D',
    bottom: -16,
    left: 16,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#B8A9D9',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    marginTop: 48,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#5A3A93',
    opacity: 0.2,
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#6B4FA3',
    opacity: 0.15,
    bottom: -30,
    left: -30,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7B5FB3',
    opacity: 0.1,
    top: '30%',
    left: -20,
  },
});
