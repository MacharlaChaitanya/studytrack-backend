/**
 * ProgressBar — Thin gold progress indicator
 * Matches .h-1 .bg-[#C8A97E] bars from Stitch
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';

export default function ProgressBar({ progress = 0, height = 4, color, trackColor }) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor || COLORS.primaryLight }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            height,
            backgroundColor: color || COLORS.accent,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.full,
  },
});
