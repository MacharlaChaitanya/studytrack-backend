/**
 * RootNavigator — Conditional navigation based on auth state
 *
 * Not logged in  → Auth stack (Login / Signup)
 * Logged in, not onboarded → Onboarding screen
 * Logged in + onboarded → Main app (tabs + modals)
 */
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import TabNavigator from './TabNavigator';
import AddSessionScreen from '../screens/AddSessionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS } from '../utils/theme';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: COLORS.background },
  animation: 'slide_from_right',
};

// ── Auth Stack ───────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// ── Onboarding Stack ─────────────────────────────────────
function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}

// ── Main App Stack ───────────────────────────────────────
function MainStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="AddSession"
        component={AddSessionScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { onboarded } = useApp();

  // ── Still loading auth session → show spinner ──────────
  if (authLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // ── Not logged in → Auth ───────────────────────────────
  if (!user) {
    return <AuthStack />;
  }

  // ── Logged in but checking onboarding → spinner ────────
  if (onboarded === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // ── Not onboarded → Onboarding ─────────────────────────
  if (!onboarded) {
    return <OnboardingStack />;
  }

  // ── Fully authenticated + onboarded → Main App ─────────
  return <MainStack />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
