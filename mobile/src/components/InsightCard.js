/**
 * InsightCard — Insight item with icon, title, description
 * Matches insight cards from Home_Dashboard.html
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

export default function InsightCard({ icon, iconColor, title, description, borderColor }) {
  return (
    <View style={[styles.container, borderColor && { borderLeftWidth: 4, borderLeftColor: borderColor }]}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor ? `${iconColor}15` : COLORS.accentLight }]}>
        <Ionicons name={icon || 'bulb-outline'} size={22} color={iconColor || COLORS.accent} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    ...SHADOWS.ambient,
  },
  iconWrap: {
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.primary,
  },
  description: {
    ...FONTS.bodySm,
    color: COLORS.onSecondaryContainer,
    marginTop: SPACING.xs,
  },
});
