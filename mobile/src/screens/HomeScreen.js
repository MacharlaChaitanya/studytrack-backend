/**
 * HomeScreen — Main Dashboard
 * Production-polished: skeleton loading, pull-to-refresh, animated
 * "Do This Now" with Start Now CTA, emotional streak badge, empty states.
 */

import React, { useRef, useEffect, useCallback, memo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  StyleSheet, Dimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '../components/Card';
import StatBox from '../components/StatBox';
import ProgressBar from '../components/ProgressBar';
import ErrorMessage from '../components/ErrorMessage';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { useApi } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { getDailyStats, getStreak, getNextAction } from '../services/api';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

const { width } = Dimensions.get('window');

// ── Helpers ──────────────────────────────────────────────
function formatMinutes(mins) {
  if (!mins || mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function focusLabel(score) {
  if (score >= 80) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

// ── Fade-in wrapper ──────────────────────────────────────
const FadeIn = memo(function FadeIn({ delay = 0, children, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
});

export default function HomeScreen({ navigation }) {
  const { userId, triggerRefresh } = useApp();
  const insets = useSafeAreaInsets();

  const stats = useApi(getDailyStats, [userId]);
  const streak = useApi(getStreak, [userId]);
  const nextAction = useApi(getNextAction, [userId]);

  // ── Pull-to-refresh ────────────────────────────────────
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    triggerRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }, [triggerRefresh]);

  // ── Loading: show skeleton on first load ───────────────
  const isFirstLoad = stats.loading && streak.loading && !stats.data && !streak.data;
  if (isFirstLoad) {
    return (
      <View style={{ paddingTop: insets.top }}>
        <DashboardSkeleton />
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────
  if (stats.error && !stats.data) {
    return <ErrorMessage message={stats.error} onRetry={stats.refetch} />;
  }

  // ── Data extraction ────────────────────────────────────
  const dailyScore = Math.round(stats.data?.daily_score ?? 0);
  const studyTime = formatMinutes(stats.data?.total_study_time ?? 0);
  const taskCompletionRate = `${Math.round(stats.data?.task_completion_rate ?? 0)}%`;
  const avgAccuracy = `${Math.round(stats.data?.avg_accuracy ?? 0)}%`;
  const focusScore = Math.round(stats.data?.focus_score ?? 0);
  const focus = focusLabel(focusScore);

  const currentStreak = streak.data?.current_streak ?? 0;
  const longestStreak = streak.data?.longest_streak ?? 0;

  const actionData = nextAction.data;
  const hasAction = actionData?.task != null;

  // ── If no data at all (fresh user) ─────────────────────
  const isNewUser = dailyScore === 0 && (stats.data?.total_study_time ?? 0) === 0;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.accent}
          colors={[COLORS.accent]}
          progressBackgroundColor={COLORS.card}
        />
      }
    >
      {/* Header */}
      <FadeIn>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>STUDYTRACK AI</Text>
            <Text style={styles.headline}>Ready for deep work?</Text>
          </View>
          {/* Streak Badge — emotional */}
          <TouchableOpacity
            style={[styles.streakBadge, currentStreak > 0 && styles.streakBadgeActive]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 16 }}>{currentStreak > 0 ? '🔥' : '💪'}</Text>
            <Text style={styles.streakText}>
              {currentStreak > 0 ? `${currentStreak} day${currentStreak > 1 ? 's' : ''}` : 'Start today'}
            </Text>
          </TouchableOpacity>
        </View>
      </FadeIn>

      {/* ── NEW USER EMPTY STATE ──────────────────────────── */}
      {isNewUser && !hasAction ? (
        <FadeIn delay={100}>
          <Card style={styles.emptyHero}>
            <View style={styles.emptyIcon}>
              <Ionicons name="book-outline" size={40} color={COLORS.accent} />
            </View>
            <Text style={[FONTS.h2, { textAlign: 'center', marginTop: SPACING.md }]}>Start Your Journey</Text>
            <Text style={[FONTS.bodyMd, { color: COLORS.secondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 22 }]}>
              Log your first study session to see your focus score, streaks, and personalized insights.
            </Text>
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={() => navigation.navigate('AddSession')}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.ctaPrimaryText}>Add First Session</Text>
            </TouchableOpacity>
          </Card>
        </FadeIn>
      ) : (
        <>
          {/* Hero Score Card */}
          <FadeIn delay={60}>
            <Card style={styles.heroCard}>
              <Text style={styles.heroLabel}>YOUR DAILY FOCUS SCORE</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreValue}>{dailyScore}</Text>
                <Text style={styles.scoreMax}>/ 100</Text>
              </View>
              <View style={styles.progressRow}>
                <View style={{ flex: 1 }}>
                  <ProgressBar progress={dailyScore} />
                </View>
                <Text style={styles.changeText}>Focus: {focusScore}%</Text>
              </View>
              <View style={styles.chipRow}>
                <View style={styles.chipDark}>
                  <Text style={styles.chipDarkText}>Accuracy: {avgAccuracy}</Text>
                </View>
                <View style={styles.chipGold}>
                  <Text style={styles.chipGoldText}>Best streak: {longestStreak}d</Text>
                </View>
              </View>
              <View style={styles.heroGlow} />
            </Card>
          </FadeIn>

          {/* Focus Level Card */}
          <FadeIn delay={120}>
            <Card dark style={styles.focusCard}>
              <Ionicons name="flash" size={28} color={COLORS.accent} />
              <Text style={styles.focusLabelText}>FOCUS LEVEL</Text>
              <Text style={styles.focusValue}>{focus}</Text>
              <Text style={styles.focusHint}>
                {focusScore >= 80 ? 'Peak performance detected' : focusScore >= 50 ? 'Moderate focus — minimize distractions' : 'Low focus — consider a break'}
              </Text>
            </Card>
          </FadeIn>

          {/* Stats Grid */}
          <FadeIn delay={180}>
            <View style={styles.statsGrid}>
              <StatBox label="TOTAL STUDY TIME" value={studyTime} style={styles.statItem} />
              <StatBox label="TASK COMPLETION" value={taskCompletionRate} style={styles.statItem} />
              <StatBox label="AVG. ACCURACY" value={avgAccuracy} style={styles.statItem} />
              <StatBox label="FOCUS SCORE" value={`${focusScore}%`} style={styles.statItem} />
            </View>
          </FadeIn>
        </>
      )}

      {/* ── DO THIS NOW — Enhanced ────────────────────────── */}
      <FadeIn delay={240}>
        {nextAction.loading && !actionData ? (
          <Card style={{ marginBottom: SPACING.cardGap, padding: SPACING.lg }}>
            <Text style={[FONTS.bodySm, { color: COLORS.secondary }]}>Loading next action…</Text>
          </Card>
        ) : hasAction ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Do This Now</Text>
              <View style={styles.liveDot} />
            </View>
            <Card style={styles.actionCard}>
              {/* Badge */}
              <View style={styles.actionBadgeRow}>
                <View style={styles.actionIconCircle}>
                  <Ionicons name="rocket" size={18} color={COLORS.white} />
                </View>
                <Text style={[FONTS.labelCaps, { color: COLORS.accent }]}>PRIORITY ACTION</Text>
                {actionData.suggested_duration > 0 && (
                  <View style={styles.durationChip}>
                    <Ionicons name="time-outline" size={12} color={COLORS.accent} />
                    <Text style={styles.durationText}>{actionData.suggested_duration}m</Text>
                  </View>
                )}
              </View>

              {/* Content */}
              <Text style={styles.actionTitle}>{actionData.task}</Text>
              {actionData.subject ? (
                <Text style={styles.actionSubject}>{actionData.subject}</Text>
              ) : null}
              <Text style={styles.actionReason}>{actionData.reason}</Text>

              {/* CTA — Start Now */}
              <TouchableOpacity
                style={styles.startNowBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('AddSession', {
                  prefillSubject: actionData.subject || '',
                  prefillTopic: actionData.task?.replace('Revise weak topic: ', '') || '',
                })}
              >
                <Ionicons name="play-circle" size={22} color={COLORS.primary} />
                <Text style={styles.startNowText}>Start Now</Text>
              </TouchableOpacity>
            </Card>
          </View>
        ) : !isNewUser ? (
          <Card style={styles.allDoneCard}>
            <Ionicons name="checkmark-circle" size={36} color={COLORS.accent} />
            <Text style={[FONTS.h3, { marginTop: SPACING.sm, textAlign: 'center' }]}>All done for today!</Text>
            <Text style={[FONTS.bodySm, { color: COLORS.secondary, textAlign: 'center', marginTop: SPACING.xs }]}>
              {actionData?.reason || 'Great work — you completed everything.'}
            </Text>
          </Card>
        ) : null}
      </FadeIn>

      {/* Quick Navigation */}
      <FadeIn delay={300}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: SPACING.cardGap, marginBottom: SPACING.lg }}>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Insights')} activeOpacity={0.7}>
            <Ionicons name="bulb-outline" size={22} color={COLORS.accent} />
            <Text style={styles.quickLinkText}>Insights</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('AddSession')} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={22} color={COLORS.accent} />
            <Text style={styles.quickLinkText}>New Session</Text>
          </TouchableOpacity>
        </View>
      </FadeIn>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.containerPadding, paddingTop: SPACING.md },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: SPACING.lg },
  greeting: { ...FONTS.labelCaps, color: COLORS.onSecondaryContainer, marginBottom: SPACING.xs },
  headline: { ...FONTS.h2, color: COLORS.primary },

  // Streak Badge
  streakBadge: {
    backgroundColor: COLORS.card, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, ...SHADOWS.lift,
  },
  streakBadgeActive: { borderWidth: 1.5, borderColor: 'rgba(200,169,126,0.4)' },
  streakText: { fontFamily: 'Manrope-Bold', fontSize: 14, color: COLORS.primary },

  // Hero Card
  heroCard: { padding: SPACING.lg, marginBottom: SPACING.cardGap, overflow: 'hidden' },
  heroLabel: { ...FONTS.labelCaps, color: COLORS.onSecondaryContainer, marginBottom: SPACING.sm },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm },
  scoreValue: { fontFamily: 'Manrope-ExtraBold', fontSize: 48, lineHeight: 56, color: COLORS.primary },
  scoreMax: { fontFamily: 'Manrope-SemiBold', fontSize: 20, color: COLORS.accent },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.xl },
  changeText: { ...FONTS.bodySm, fontFamily: 'Manrope-Bold', color: COLORS.primary },
  chipRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  chipDark: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryLight },
  chipDarkText: { fontFamily: 'Manrope-Bold', fontSize: 12, color: COLORS.primary },
  chipGold: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.accentLight },
  chipGoldText: { fontFamily: 'Manrope-Bold', fontSize: 12, color: COLORS.accent },
  heroGlow: { position: 'absolute', right: -40, bottom: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(200,169,126,0.05)' },

  // Focus Card
  focusCard: { marginBottom: SPACING.cardGap, padding: SPACING.lg },
  focusLabelText: { fontFamily: 'Manrope-Bold', fontSize: 11, letterSpacing: 2, color: 'rgba(168,162,158,0.8)', marginTop: SPACING.md, textTransform: 'uppercase' },
  focusValue: { fontFamily: 'Manrope-Bold', fontSize: 28, color: COLORS.white, marginTop: SPACING.xs },
  focusHint: { fontFamily: 'Manrope', fontSize: 12, color: 'rgba(120,113,108,1)' },

  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.cardGap, marginBottom: SPACING.lg },
  statItem: { width: (width - SPACING.containerPadding * 2 - SPACING.cardGap) / 2 },

  // Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  sectionTitle: { ...FONTS.h3, color: COLORS.primary },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },

  // ── Do This Now — enhanced ─────────────────────────────
  actionCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.cardGap, borderLeftWidth: 4, borderLeftColor: COLORS.accent,
    ...SHADOWS.lift,
  },
  actionBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  actionIconCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  durationChip: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.accentLight, paddingHorizontal: SPACING.sm + 2, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  durationText: { fontFamily: 'Manrope-Bold', fontSize: 12, color: COLORS.accent },
  actionTitle: { ...FONTS.h3, color: COLORS.primary, marginBottom: SPACING.xs },
  actionSubject: { ...FONTS.bodySm, fontFamily: 'Manrope-SemiBold', color: COLORS.onSecondaryContainer, marginBottom: SPACING.sm },
  actionReason: { ...FONTS.bodySm, color: COLORS.secondary, lineHeight: 20 },
  startNowBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    marginTop: SPACING.lg, backgroundColor: COLORS.accent, height: 48,
    borderRadius: RADIUS.full, ...SHADOWS.lift,
  },
  startNowText: { ...FONTS.button, color: COLORS.primary },

  // All done
  allDoneCard: { marginBottom: SPACING.cardGap, padding: SPACING.lg, alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.xl, ...SHADOWS.ambient },

  // Empty state
  emptyHero: { padding: SPACING.xl, marginBottom: SPACING.lg, alignItems: 'center' },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accentLight, alignItems: 'center', justifyContent: 'center' },
  ctaPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.lg,
    backgroundColor: COLORS.accent, paddingHorizontal: SPACING.xl, height: 48,
    borderRadius: RADIUS.full, ...SHADOWS.lift,
  },
  ctaPrimaryText: { ...FONTS.button, color: COLORS.primary },

  // Quick Links
  quickLink: { flex: 1, backgroundColor: COLORS.card, padding: SPACING.lg, borderRadius: RADIUS.xl, alignItems: 'center', gap: SPACING.sm, ...SHADOWS.ambient },
  quickLinkText: { fontFamily: 'Manrope-SemiBold', fontSize: 13, color: COLORS.primary },
});
