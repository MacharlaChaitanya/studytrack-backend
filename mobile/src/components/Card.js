/**
 * Card — Reusable cream card with ambient shadow
 * Matches .card-zen / .bg-[#FAF3E0] from Stitch
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

export default function Card({ children, style, borderLeft, dark }) {
  return (
    <View
      style={[
        styles.card,
        dark && styles.dark,
        borderLeft && { borderLeftWidth: 4, borderLeftColor: borderLeft },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.ambient,
  },
  dark: {
    backgroundColor: COLORS.primary,
  },
});
