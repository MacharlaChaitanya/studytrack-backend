/**
 * SkeletonLoader — Shimmer placeholder cards
 * Shows pulsing card shapes while data loads. No third-party deps.
 */

import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

const { width } = Dimensions.get('window');
const CARD_W = width - SPACING.containerPadding * 2;
const HALF_W = (CARD_W - SPACING.cardGap) / 2;

function Bone({ w, h, style, radius = RADIUS.md }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius: radius, backgroundColor: COLORS.surfaceContainerHigh, opacity },
        style,
      ]}
    />
  );
}

/** Dashboard skeleton — hero card + stat grid + action card */
export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <View style={styles.wrap}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View>
          <Bone w={100} h={12} style={{ marginBottom: 8 }} />
          <Bone w={180} h={24} />
        </View>
        <Bone w={80} h={32} radius={RADIUS.full} />
      </View>

      {/* Hero card */}
      <View style={styles.card}>
        <Bone w={140} h={12} style={{ marginBottom: 12 }} />
        <Bone w={100} h={48} style={{ marginBottom: 16 }} />
        <Bone w={CARD_W - 32} h={4} radius={RADIUS.full} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Bone w={90} h={24} radius={RADIUS.full} />
          <Bone w={110} h={24} radius={RADIUS.full} />
        </View>
      </View>

      {/* Focus card */}
      <View style={[styles.card, { backgroundColor: COLORS.primary, height: 110 }]}>
        <Bone w={28} h={28} radius={14} style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <Bone w={90} h={10} style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <Bone w={60} h={24} style={{ marginTop: 6, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      </View>

      {/* Stats grid */}
      <View style={styles.gridRow}>
        <View style={[styles.statCard, { width: HALF_W }]}><Bone w={60} h={10} /><Bone w={50} h={22} style={{ marginTop: 8 }} /></View>
        <View style={[styles.statCard, { width: HALF_W }]}><Bone w={60} h={10} /><Bone w={50} h={22} style={{ marginTop: 8 }} /></View>
      </View>
      <View style={styles.gridRow}>
        <View style={[styles.statCard, { width: HALF_W }]}><Bone w={60} h={10} /><Bone w={50} h={22} style={{ marginTop: 8 }} /></View>
        <View style={[styles.statCard, { width: HALF_W }]}><Bone w={60} h={10} /><Bone w={50} h={22} style={{ marginTop: 8 }} /></View>
      </View>

      {/* Action card */}
      <View style={styles.card}>
        <Bone w={120} h={12} style={{ marginBottom: 10 }} />
        <Bone w={CARD_W - 32} h={16} style={{ marginBottom: 8 }} />
        <Bone w={200} h={14} />
      </View>
    </View>
  );
});

/** Plan / List skeleton — 3–4 item placeholder */
export const ListSkeleton = memo(function ListSkeleton({ count = 4 }) {
  return (
    <View style={styles.wrap}>
      {/* Summary card */}
      <View style={styles.card}>
        <Bone w={140} h={20} style={{ marginBottom: 8 }} />
        <Bone w={CARD_W - 32} h={4} radius={RADIUS.full} />
      </View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }]}>
          <Bone w={24} h={24} radius={RADIUS.md} />
          <View style={{ flex: 1 }}>
            <Bone w={180} h={14} style={{ marginBottom: 6 }} />
            <Bone w={100} h={10} />
          </View>
        </View>
      ))}
    </View>
  );
});

/** Analytics skeleton */
export const AnalyticsSkeleton = memo(function AnalyticsSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Bone w={100} h={12} style={{ marginBottom: 8 }} />
        <Bone w={120} h={32} />
      </View>
      <View style={styles.gridRow}>
        <View style={[styles.statCard, { width: HALF_W, height: 120 }]}><Bone w={80} h={10} /><Bone w={60} h={60} radius={30} style={{ marginTop: 10 }} /></View>
        <View style={[styles.statCard, { width: HALF_W, height: 120 }]}><Bone w={80} h={10} /><Bone w={50} h={28} style={{ marginTop: 16 }} /></View>
      </View>
      <View style={styles.card}>
        <Bone w={100} h={16} style={{ marginBottom: 16 }} />
        <Bone w={CARD_W - 32} h={8} radius={RADIUS.full} style={{ marginBottom: 8 }} />
        <Bone w={200} h={12} />
      </View>
    </View>
  );
});

/** Insights skeleton */
export const InsightsSkeleton = memo(function InsightsSkeleton() {
  return (
    <View style={styles.wrap}>
      <Bone w={180} h={28} style={{ marginBottom: 8 }} />
      <Bone w={260} h={14} style={{ marginBottom: 20 }} />
      {[1, 2].map((i) => (
        <View key={i} style={[styles.card, { marginBottom: SPACING.cardGap }]}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <Bone w={20} h={20} radius={10} />
            <Bone w={100} h={12} />
          </View>
          <Bone w={CARD_W - 32} h={14} style={{ marginBottom: 6 }} />
          <Bone w={200} h={14} />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.containerPadding,
    paddingTop: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.cardGap,
    ...SHADOWS.ambient,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.cardGap,
    marginBottom: SPACING.cardGap,
  },
  statCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.ambient,
  },
});
