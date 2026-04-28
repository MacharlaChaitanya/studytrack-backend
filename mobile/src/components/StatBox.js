/**
 * StatBox — Mini stat tile with label + value
 * Used in Home Dashboard + Analytics bento grid
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

export default function StatBox({ label, value, style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.ambient,
  },
  label: {
    ...FONTS.tiny,
    color: COLORS.onSecondaryContainer,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  value: {
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
    lineHeight: 28,
    color: COLORS.primary,
    textAlign: 'center',
  },
});
