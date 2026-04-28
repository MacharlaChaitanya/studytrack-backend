/**
 * Toast — Lightweight non-blocking feedback system
 *
 * Usage:
 *   import { ToastProvider, useToast } from '../components/Toast';
 *
 *   // Wrap your app:
 *   <ToastProvider>...</ToastProvider>
 *
 *   // Show a toast:
 *   const toast = useToast();
 *   toast.show('Session logged successfully ✅');
 *   toast.show('Task completed 🎯', 'success');
 *   toast.show('Something went wrong', 'error');
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, memo } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';

const { width } = Dimensions.get('window');

const ToastContext = createContext(null);

// ── Icon + Color per type ────────────────────────────────
const TYPE_MAP = {
  success: { icon: 'checkmark-circle', bg: '#1A3A23', text: '#86EFAC', border: '#22C55E' },
  error:   { icon: 'alert-circle',     bg: '#3A1A1A', text: '#FCA5A5', border: '#EF4444' },
  info:    { icon: 'information-circle', bg: '#1A2A3A', text: '#93C5FD', border: '#3B82F6' },
  default: { icon: 'bulb',              bg: COLORS.primary, text: COLORS.accent, border: COLORS.accent },
};

// ── Single Toast Bubble ─────────────────────────────────
const ToastBubble = memo(function ToastBubble({ message, type = 'default', onDone }) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const t = TYPE_MAP[type] || TYPE_MAP.default;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 60, friction: 9 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => onDone?.());
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          top: insets.top + 8,
          backgroundColor: t.bg,
          borderColor: t.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Ionicons name={t.icon} size={20} color={t.text} />
      <Text style={[styles.text, { color: t.text }]} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
});

// ── Provider ─────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((message, type = 'default') => {
    const id = ++idRef.current;
    setQueue(prev => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id) => {
    setQueue(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {queue.map(t => (
        <ToastBubble key={t.id} message={t.message} type={t.type} onDone={() => dismiss(t.id)} />
      ))}
    </ToastContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    left: SPACING.containerPadding,
    right: SPACING.containerPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  text: {
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
});
