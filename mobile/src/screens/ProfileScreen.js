/**
 * ProfileScreen — User Profile
 * Polished: pull-to-refresh, toast actions, consistent layout.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { ListSkeleton } from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';
import { useApi } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getStreak, getDailyStats, getWeeklyStats } from '../services/api';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

function formatMinutes(mins) {
  if (!mins || mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function ProfileScreen({ navigation }) {
  const { userId, triggerRefresh, profile } = useApp();
  const { user, logout } = useAuth();
  const toast = useToast();
  const [loggingOut, setLoggingOut] = useState(false);
  const insets = useSafeAreaInsets();

  const streakApi = useApi(getStreak, [userId]);
  const dailyApi = useApi(getDailyStats, [userId]);
  const weeklyApi = useApi(getWeeklyStats, [userId]);

  // ── Pull-to-refresh ────────────────────────────────────
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    triggerRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }, [triggerRefresh]);

  const isFirstLoad = streakApi.loading && dailyApi.loading && !streakApi.data && !dailyApi.data;
  if (isFirstLoad) return <View style={{ paddingTop: insets.top }}><ListSkeleton count={3} /></View>;

  const currentStreak = streakApi.data?.current_streak ?? 0;
  const longestStreak = streakApi.data?.longest_streak ?? 0;
  const totalStudyTime = weeklyApi.data?.total_study_time ?? 0;
  const dailyGoal = 4;
  const todayStudyTime = dailyApi.data?.total_study_time ?? 0;
  const goalProgress = dailyGoal > 0 ? Math.min(Math.round((todayStudyTime / (dailyGoal * 60)) * 100), 100) : 0;

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} colors={[COLORS.accent]} progressBackgroundColor={COLORS.card} />
      }
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={FONTS.h3}>Profile</Text>
        <TouchableOpacity><Ionicons name="notifications-outline" size={24} color={COLORS.accent} /></TouchableOpacity>
      </View>

      {/* Avatar Card */}
      <Card style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 36 }}>{profile?.name ? profile.name.charAt(0).toUpperCase() : '👤'}</Text>
        </View>
        <Text style={[FONTS.h2, { textAlign: 'center', marginTop: SPACING.sm }]}>{profile?.name || 'Student'}</Text>
        <Text style={[FONTS.bodySm, { color: COLORS.onSurfaceVariant, textAlign: 'center' }]}>{user?.email}</Text>
        {profile?.target_exam ? (
          <View style={styles.examBadge}>
            <Ionicons name="school-outline" size={14} color={COLORS.accent} />
            <Text style={styles.examBadgeText}>{profile.target_exam}</Text>
          </View>
        ) : null}
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="flame" size={32} color={COLORS.accent} />
          <Text style={[FONTS.h2, { marginTop: SPACING.xs }]}>{currentStreak}</Text>
          <Text style={FONTS.labelCaps}>DAY STREAK</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="hourglass-outline" size={32} color={COLORS.outline} />
          <Text style={[FONTS.h2, { marginTop: SPACING.xs }]}>{formatMinutes(totalStudyTime)}</Text>
          <Text style={FONTS.labelCaps}>THIS WEEK</Text>
        </Card>
      </View>

      {/* Longest Streak */}
      <Card style={{ marginBottom: SPACING.cardGap }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
          <Ionicons name="trophy-outline" size={20} color={COLORS.accent} />
          <Text style={[FONTS.bodyMd, { fontFamily: 'Manrope-SemiBold' }]}>Longest Streak</Text>
          <View style={{ flex: 1 }} />
          <Text style={[FONTS.h3, { color: COLORS.accent }]}>{longestStreak} days</Text>
        </View>
      </Card>

      {/* Daily Goal */}
      <Card style={{ marginBottom: SPACING.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[FONTS.bodySm, { color: COLORS.onSurfaceVariant }]}>Daily Study Goal</Text>
          <Text style={[FONTS.bodyMd, { fontFamily: 'Manrope-SemiBold' }]}>
            {formatMinutes(todayStudyTime)} of {dailyGoal}h
          </Text>
        </View>
        <View style={{ marginTop: SPACING.sm }}>
          <ProgressBar progress={goalProgress} />
        </View>
      </Card>

      {/* Actions */}
      <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.7} onPress={() => toast.show('Profile editing coming soon', 'info')}>
        <Ionicons name="settings-outline" size={20} color={COLORS.onSurface} />
        <Text style={[FONTS.button, { color: COLORS.onSurface }]}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.dangerBtn, loggingOut && { opacity: 0.6 }]}
        activeOpacity={0.7}
        disabled={loggingOut}
        onPress={() => {
          Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Logout',
              style: 'destructive',
              onPress: async () => {
                setLoggingOut(true);
                try {
                  await logout();
                } catch {
                  toast.show('Failed to logout', 'error');
                  setLoggingOut(false);
                }
              },
            },
          ]);
        }}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={[FONTS.button, { color: COLORS.error }]}>{loggingOut ? 'Logging out…' : 'Logout'}</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.containerPadding, paddingTop: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  avatarCard: { alignItems: 'center', paddingVertical: SPACING.lg, marginBottom: SPACING.cardGap },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.surfaceContainerHigh, borderWidth: 4, borderColor: COLORS.background, alignItems: 'center', justifyContent: 'center', ...SHADOWS.ambient },
  statsRow: { flexDirection: 'row', gap: SPACING.cardGap, marginBottom: SPACING.cardGap },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.xs },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.secondary, height: 52, borderRadius: RADIUS.full, marginBottom: SPACING.sm },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, height: 52, borderRadius: RADIUS.full, marginTop: SPACING.xs },
  examBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.accentLight, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full, marginTop: SPACING.sm },
  examBadgeText: { fontFamily: 'Manrope-SemiBold', fontSize: 12, color: COLORS.accent },
});
