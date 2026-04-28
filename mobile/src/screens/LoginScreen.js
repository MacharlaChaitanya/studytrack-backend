/**
 * LoginScreen — Email + Password login
 * Minimal, fast, consistent with the app's design system.
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, StyleSheet, Animated, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const passwordRef = useRef(null);

  // Fade-in
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password) { setError('Please enter your password'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Auth state change listener handles navigation automatically
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 20 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={36} color={COLORS.primary} />
          </View>
          <Text style={styles.logoText}>StudyTrack AI</Text>
          <Text style={styles.subtitle}>Focus. Learn. Grow.</Text>
        </View>

        {/* Error banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Email */}
        <Text style={styles.label}>EMAIL</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={18} color={COLORS.secondary} />
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={`${COLORS.secondary}80`}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>PASSWORD</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color={COLORS.secondary} />
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={`${COLORS.secondary}80`}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* Login button */}
        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color={COLORS.primary} />
              <Text style={styles.primaryBtnText}>Log In</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sign up link */}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>Create an account</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SPACING.containerPadding, justifyContent: 'center' },
  // Logo
  logoWrap: { alignItems: 'center', marginBottom: SPACING.xl + 8 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.lift, marginBottom: SPACING.md,
  },
  logoText: { fontFamily: 'Manrope-ExtraBold', fontSize: 28, color: COLORS.primary, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'Manrope-Medium', fontSize: 14, color: COLORS.secondary, marginTop: SPACING.xs },
  // Error
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(239,68,68,0.08)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
  },
  errorText: { flex: 1, fontFamily: 'Manrope-SemiBold', fontSize: 13, color: '#EF4444' },
  // Input
  label: { ...FONTS.labelCaps, color: COLORS.secondary, marginBottom: SPACING.xs, paddingLeft: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.card, height: 52, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg, marginBottom: SPACING.md, ...SHADOWS.ambient,
  },
  input: { flex: 1, fontFamily: 'Manrope-Medium', fontSize: 15, color: COLORS.primary },
  // Buttons
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.accent, height: 56, borderRadius: RADIUS.full, marginTop: SPACING.sm, ...SHADOWS.lift,
  },
  primaryBtnText: { fontFamily: 'Manrope-Bold', fontSize: 16, color: COLORS.primary },
  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.outlineVariant },
  dividerText: { fontFamily: 'Manrope-Medium', fontSize: 13, color: COLORS.secondary, marginHorizontal: SPACING.md },
  // Secondary
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    height: 52, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.accent,
  },
  secondaryBtnText: { fontFamily: 'Manrope-SemiBold', fontSize: 15, color: COLORS.accent },
});
