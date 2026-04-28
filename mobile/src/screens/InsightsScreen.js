/**
 * InsightsScreen — AI-Driven Insights
 * Polished: skeleton loading, pull-to-refresh, toast for fix action, refined cards.
 */
import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import ErrorMessage from '../components/ErrorMessage';
import { InsightsSkeleton } from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';
import { useApi } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { getInsights, fixTopic } from '../services/api';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';

const INSIGHT_STYLE = {
  low_accuracy:     { icon: 'trending-down',     color: COLORS.error,  label: 'IMPROVEMENT AREA' },
  low_consistency:  { icon: 'calendar-outline',   color: COLORS.accent, label: 'CONSISTENCY' },
  focus_drop:       { icon: 'flash-outline',      color: '#FF9800',     label: 'FOCUS' },
  high_performer:   { icon: 'trophy-outline',     color: COLORS.accent, label: 'ACHIEVEMENT' },
  default:          { icon: 'bulb-outline',        color: COLORS.accent, label: 'INSIGHT' },
};

function getInsightStyle(type) { return INSIGHT_STYLE[type] || INSIGHT_STYLE.default; }

function priorityLabel(p) {
  if (p === 1) return 'High Priority';
  if (p === 2) return 'Medium Priority';
  return 'Low Priority';
}

export default function InsightsScreen() {
  const { userId, triggerRefresh } = useApp();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch } = useApi(getInsights, [userId]);

  // ── Pull-to-refresh ────────────────────────────────────
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    triggerRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }, [triggerRefresh]);

  const isFirstLoad = loading && !data;
  if (isFirstLoad) return <View style={{ paddingTop: insets.top }}><InsightsSkeleton /></View>;
  if (error && !data) return <ErrorMessage message={error} onRetry={refetch} />;

  const insights = data?.insights ?? [];
  const insightCount = data?.insight_count ?? insights.length;

  const handleFixTopic = async (msg) => {
    try {
      await fixTopic({ user_id: userId, topic: msg, subject: '' });
      triggerRefresh();
      toast.show('Added to your plan ✨', 'success');
    } catch {
      toast.show('Failed to create action', 'error');
    }
  };

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} colors={[COLORS.accent]} progressBackgroundColor={COLORS.card} />
      }
    >
      <Text style={FONTS.h1}>Personal Insights</Text>
      <Text style={[FONTS.bodyMd, { color: COLORS.secondary, marginTop: SPACING.sm, marginBottom: SPACING.lg }]}>
        AI-driven analysis of your recent learning patterns.
      </Text>

      {/* Summary chip */}
      <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg }}>
        <View style={styles.summaryChip}>
          <Ionicons name="analytics-outline" size={16} color={COLORS.accent} />
          <Text style={styles.summaryText}>{insightCount} insight{insightCount !== 1 ? 's' : ''} found</Text>
        </View>
      </View>

      {/* Empty state */}
      {insights.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={40} color={COLORS.accent} />
          </View>
          <Text style={[FONTS.h3, { textAlign: 'center', marginTop: SPACING.md }]}>Everything looks great!</Text>
          <Text style={[FONTS.bodySm, { color: COLORS.secondary, textAlign: 'center', marginTop: SPACING.sm }]}>
            No issues detected. Keep up the good work and check back after your next session.
          </Text>
        </Card>
      ) : (
        insights.map((insight, index) => {
          const s = getInsightStyle(insight.type);
          return (
            <Card key={index} borderLeft={s.color} style={{ marginBottom: SPACING.cardGap }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md }}>
                <Ionicons name={s.icon} size={20} color={s.color} />
                <Text style={[FONTS.labelCaps, { color: s.color }]}>{s.label}</Text>
                <View style={{ flex: 1 }} />
                <View style={[styles.priorityBadge, insight.priority === 1 && { backgroundColor: 'rgba(255,0,0,0.08)' }]}>
                  <Text style={[FONTS.tiny, { color: insight.priority === 1 ? COLORS.error : COLORS.secondary, fontFamily: 'Manrope-SemiBold' }]}>
                    {priorityLabel(insight.priority)}
                  </Text>
                </View>
              </View>

              <Text style={[FONTS.bodyMd, { color: COLORS.primary, lineHeight: 22 }]}>{insight.message}</Text>

              {insight.type === 'low_accuracy' && (
                <TouchableOpacity style={styles.primaryBtn} onPress={() => handleFixTopic(insight.message)} activeOpacity={0.85}>
                  <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                  <Text style={styles.primaryBtnText}>Fix This</Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        })
      )}

      {/* Motivational footer */}
      <View style={styles.motivational}>
        <View style={{ flex: 1 }}>
          <Text style={[FONTS.h3, { color: COLORS.primary, marginBottom: SPACING.sm }]}>"Small wins lead to big results."</Text>
          <Text style={[FONTS.bodySm, { color: COLORS.primary, opacity: 0.7 }]}>
            Keep tracking sessions to unlock deeper insights about your study patterns.
          </Text>
        </View>
        <View style={styles.rocketCircle}>
          <Ionicons name="rocket-outline" size={32} color={COLORS.primary} />
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.containerPadding, paddingTop: SPACING.md },
  summaryChip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.accentLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  summaryText: { ...FONTS.bodySm, fontFamily: 'Manrope-SemiBold', color: COLORS.accent },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accentLight, alignItems: 'center', justifyContent: 'center' },
  priorityBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full, backgroundColor: 'rgba(200,169,126,0.1)' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.accent, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.full, marginTop: SPACING.lg, alignSelf: 'flex-start' },
  primaryBtnText: { ...FONTS.button, color: COLORS.primary },
  motivational: { marginTop: SPACING.xl, backgroundColor: COLORS.accent, borderRadius: RADIUS.xxl, padding: SPACING.xl, flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  rocketCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: 'rgba(30,30,30,0.1)', alignItems: 'center', justifyContent: 'center' },
});
