/**
 * ErrorMessage — Graceful error display with retry button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={48} color={COLORS.secondary} />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message || 'Please check your connection and try again.'}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          <Ionicons name="refresh" size={18} color={COLORS.primary} />
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 40,
    paddingHorizontal: SPACING.xl,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.primary,
    marginTop: SPACING.md,
  },
  message: {
    ...FONTS.bodySm,
    color: COLORS.secondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 4,
    borderRadius: RADIUS.full,
  },
  buttonText: {
    ...FONTS.button,
    color: COLORS.primary,
  },
});
