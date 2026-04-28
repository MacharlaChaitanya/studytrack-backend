/**
 * AnalyticsScreen — Stats & Analytics
 * Polished: skeleton loading, pull-to-refresh, toast for fix action, empty state.
 */
import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  StyleSheet, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import ErrorMessage from '../components/ErrorMessage';
import { AnalyticsSkeleton } from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';
import { useApi } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { getWeeklyStats, getWeakTopics, fixTopic } from '../services/api';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

const { width } = Dimensions.get('window');

function formatMinutes(mins) {
  if (!mins || mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function AnalyticsScreen({ navigation }) {
  const { userId, triggerRefresh } = useApp();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const weekly = useApi(getWeeklyStats, [userId]);
  const weak = useApi(getWeakTopics, [userId]);

  // ── Pull-to-refresh ────────────────────────────────────
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    triggerRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }, [triggerRefresh]);

  const isLoading = weekly.loading && weak.loading && !weekly.data && !weak.data;
  if (isLoading) return <View style={{ paddingTop: insets.top }}><AnalyticsSkeleton /></View>;
  if (weekly.error && !weekly.data) return <ErrorMessage message={weekly.error} onRetry={weekly.refetch} />;

  const totalStudyTime = weekly.data?.total_study_time ?? 0;
  const avgAccuracy = Math.round(weekly.data?.avg_accuracy ?? 0);
  const avgDailyScore = Math.round(weekly.data?.avg_daily_score ?? 0);
  const activeDays = weekly.data?.active_days ?? 0;
  const consistency = Math.round(weekly.data?.consistency ?? 0);
  const period = weekly.data?.period ?? '';
  const weakTopics = weak.data?.weak_topics ?? [];

  // ── No data empty state ────────────────────────────────
  const isNoData = totalStudyTime === 0 && avgAccuracy === 0;

  const handleFixTopic = async (topic, subject) => {
    try {
      await fixTopic({ user_id: userId, topic, subject });
      triggerRefresh();
      toast.show('Added to your plan ✨', 'success');
    } catch {
      toast.show('Failed to create fix action', 'error');
    }
  };

  if (isNoData) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { alignItems: 'center', paddingTop: 60 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} colors={[COLORS.accent]} />}
        >
          <View style={styles.emptyIcon}>
            <Ionicons name="bar-chart-outline" size={40} color={COLORS.accent} />
          </View>
          <Text style={[FONTS.h2, { marginTop: SPACING.lg, textAlign: 'center' }]}>No Data Yet</Text>
          <Text style={[FONTS.bodyMd, { color: COLORS.secondary, textAlign: 'center', marginTop: SPACING.sm, paddingHorizontal: SPACING.lg }]}>
            Start studying to see your accuracy, streaks, and performance trends here.
          </Text>
          <TouchableOpacity style={styles.emptyCta} onPress={() => navigation?.navigate?.('AddSession') || null} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.emptyCtaText}>Add First Session</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} colors={[COLORS.accent]} progressBackgroundColor={COLORS.card} />
      }
    >
      {/* Hero */}
      <Card style={styles.hero}>
        <View style={styles.heroRow}>
          <View>
            <Text style={FONTS.labelCaps}>WEEKLY TOTAL</Text>
            <Text style={styles.heroValue}>{formatMinutes(totalStudyTime)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.accent} />
              <Text style={styles.heroChange}> {activeDays}/7 active days</Text>
            </View>
            {period ? <Text style={[FONTS.bodySm, { color: COLORS.onSecondaryContainer }]}>{period}</Text> : null}
          </View>
        </View>
      </Card>

      {/* Bento Grid */}
      <View style={styles.bentoRow}>
        <Card style={styles.bentoCard}>
          <Text style={FONTS.labelCaps}>AVG ACCURACY</Text>
          <View style={styles.donutWrap}>
            <View style={styles.donutOuter}>
              <Text style={FONTS.h3}>{avgAccuracy}%</Text>
            </View>
          </View>
        </Card>
        <Card style={styles.bentoCard}>
          <Text style={FONTS.labelCaps}>AVG DAILY SCORE</Text>
          <Text style={[FONTS.h2, { marginTop: SPACING.md }]}>{avgDailyScore}</Text>
          <Text style={[FONTS.bodySm, { color: COLORS.onSecondaryContainer }]}>out of 100</Text>
        </Card>
      </View>

      {/* Consistency */}
      <Card style={{ marginBottom: SPACING.cardGap }}>
        <View style={styles.sectionHead}>
          <Text style={FONTS.h3}>Consistency</Text>
          <View style={styles.monthChip}><Text style={styles.monthText}>{consistency}%</Text></View>
        </View>
        <ProgressBar progress={consistency} height={8} />
        <Text style={[FONTS.bodySm, { color: COLORS.onSecondaryContainer, marginTop: SPACING.sm }]}>
          You were active {activeDays} out of 7 days this week.
        </Text>
      </Card>

      {/* Weak Topics */}
      {weakTopics.length > 0 ? (
        <Card borderLeft={COLORS.error} style={{ marginBottom: SPACING.cardGap }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md }}>
            <Ionicons name="warning" size={20} color={COLORS.error} />
            <Text style={FONTS.h3}>Attention Required</Text>
          </View>
          <Text style={[FONTS.bodySm, { color: COLORS.onSecondaryContainer, marginBottom: SPACING.md }]}>
            Topics with accuracy below 50% despite time investment.
          </Text>
          {weakTopics.map((t, i) => (
            <View key={i} style={styles.weakRow}>
              <View style={{ flex: 1 }}>
                <Text style={[FONTS.bodyMd, { fontFamily: 'Manrope-Bold' }]}>{t.topic}</Text>
                <Text style={[FONTS.bodySm, { color: COLORS.onSecondaryContainer }]}>
                  {t.time_spent} min spent • {t.accuracy}% accuracy
                </Text>
              </View>
              <TouchableOpacity style={styles.fixBtn} onPress={() => handleFixTopic(t.topic, t.subject)} activeOpacity={0.75}>
                <Ionicons name="sparkles" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      ) : (
        <Card style={{ marginBottom: SPACING.cardGap, alignItems: 'center', paddingVertical: SPACING.lg }}>
          <Ionicons name="checkmark-circle" size={32} color={COLORS.accent} />
          <Text style={[FONTS.h3, { marginTop: SPACING.sm }]}>No Weak Topics</Text>
          <Text style={[FONTS.bodySm, { color: COLORS.secondary, textAlign: 'center', marginTop: SPACING.xs }]}>
            All your topics are above threshold. Keep it up!
          </Text>
        </Card>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const half = (width - SPACING.containerPadding * 2 - SPACING.cardGap) / 2;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.containerPadding, paddingTop: SPACING.md },
  hero: { marginBottom: SPACING.cardGap },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroValue: { fontFamily: 'Manrope-Bold', fontSize: 32, lineHeight: 40, color: COLORS.primary },
  heroChange: { ...FONTS.bodySm, fontFamily: 'Manrope-Medium', color: COLORS.accent },
  bentoRow: { flexDirection: 'row', gap: SPACING.cardGap, marginBottom: SPACING.cardGap },
  bentoCard: { width: half },
  donutWrap: { alignItems: 'center', marginTop: SPACING.md },
  donutOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  weakRow: { backgroundColor: 'rgba(255,255,255,0.4)', padding: SPACING.md, borderRadius: RADIUS.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  fixBtn: { backgroundColor: COLORS.primary, padding: SPACING.sm, borderRadius: RADIUS.md },
  monthChip: { backgroundColor: COLORS.accentLight, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  monthText: { ...FONTS.bodySm, fontFamily: 'Manrope-SemiBold', color: COLORS.accent },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accentLight, alignItems: 'center', justifyContent: 'center' },
  emptyCta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xl, backgroundColor: COLORS.accent, paddingHorizontal: SPACING.xl, height: 48, borderRadius: RADIUS.full },
  emptyCtaText: { ...FONTS.button, color: COLORS.primary },
});
