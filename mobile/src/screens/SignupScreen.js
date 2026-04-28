/**
 * SignupScreen — Create Account (Email + Password)
 * Minimal flow — after signup, user is auto-logged in → goes to onboarding.
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

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  // Fade-in
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSignup = async () => {
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await signup(email, password);
      // Auth listener handles navigation → onboarding
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 20 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join StudyTrack AI and start learning smarter.</Text>

        {/* Error */}
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
            placeholder="Min 6 characters"
            placeholderTextColor={`${COLORS.secondary}80`}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* Confirm */}
        <Text style={styles.label}>CONFIRM PASSWORD</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.secondary} />
          <TextInput
            ref={confirmRef}
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor={`${COLORS.secondary}80`}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleSignup}
          />
        </View>

        {/* Sign up button */}
        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
          onPress={handleSignup}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <Ionicons name="person-add-outline" size={20} color={COLORS.primary} />
              <Text style={styles.primaryBtnText}>Create Account</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Already have account */}
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <Text style={[styles.linkText, { color: COLORS.accent, fontFamily: 'Manrope-Bold' }]}>Log in</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SPACING.containerPadding, justifyContent: 'center' },
  header: { marginBottom: SPACING.lg },
  title: { fontFamily: 'Manrope-ExtraBold', fontSize: 28, color: COLORS.primary, marginBottom: SPACING.xs },
  subtitle: { fontFamily: 'Manrope-Medium', fontSize: 14, color: COLORS.secondary, marginBottom: SPACING.xl },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(239,68,68,0.08)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
  },
  errorText: { flex: 1, fontFamily: 'Manrope-SemiBold', fontSize: 13, color: '#EF4444' },
  label: { ...FONTS.labelCaps, color: COLORS.secondary, marginBottom: SPACING.xs, paddingLeft: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.card, height: 52, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg, marginBottom: SPACING.md, ...SHADOWS.ambient,
  },
  input: { flex: 1, fontFamily: 'Manrope-Medium', fontSize: 15, color: COLORS.primary },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.accent, height: 56, borderRadius: RADIUS.full, marginTop: SPACING.sm, ...SHADOWS.lift,
  },
  primaryBtnText: { fontFamily: 'Manrope-Bold', fontSize: 16, color: COLORS.primary },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  linkText: { fontFamily: 'Manrope-Medium', fontSize: 14, color: COLORS.secondary },
});
