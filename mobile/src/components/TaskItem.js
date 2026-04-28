/**
 * TaskItem — Single task row with checkbox
 * Matches task cards from Task_Manager.html
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

export default function TaskItem({ title, category, timeLeft, completed, active, onToggle }) {
  return (
    <View style={[styles.container, active && styles.active]}>
      <TouchableOpacity
        onPress={onToggle}
        style={[
          styles.checkbox,
          completed && styles.checkboxDone,
          !completed && !active && styles.checkboxEmpty,
        ]}
        activeOpacity={0.7}
      >
        {completed && (
          <Ionicons name="checkmark" size={16} color={COLORS.primary} />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.titleDone]}>
          {title}
        </Text>
        <View style={styles.chipRow}>
          {category ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{category}</Text>
            </View>
          ) : null}
          {timeLeft ? (
            <View style={styles.timeChip}>
              <Ionicons name="time-outline" size={10} color={COLORS.error} />
              <Text style={styles.timeText}>{timeLeft}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <Ionicons name="reorder-three" size={20} color={COLORS.outlineVariant} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.ambient,
  },
  active: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  checkboxEmpty: {
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  title: {
    ...FONTS.bodyMd,
    fontFamily: 'Manrope-SemiBold',
    color: COLORS.primary,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.onSurfaceVariant,
    fontFamily: 'Manrope',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(168,162,158,0.2)',
    borderRadius: RADIUS.full,
  },
  chipText: {
    ...FONTS.tiny,
    color: COLORS.onSurfaceVariant,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeText: {
    ...FONTS.tiny,
    color: COLORS.error,
  },
});
