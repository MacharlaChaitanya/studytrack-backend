/**
 * TasksScreen — Task Manager
 * Polished: skeleton loading, pull-to-refresh, toast feedback, empty state with CTA.
 */
import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import TaskItem from '../components/TaskItem';
import ErrorMessage from '../components/ErrorMessage';
import { ListSkeleton } from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';
import { useApi } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { getTasks, updateTask } from '../services/api';
import { COLORS, FONTS, RADIUS, SPACING } from '../utils/theme';

// ── Animated task row wrapper ────────────────────────────
const AnimatedTaskRow = memo(function AnimatedTaskRow({ children, delay = 0 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }], marginBottom: SPACING.cardGap }}>
      {children}
    </Animated.View>
  );
});

export default function TasksScreen({ navigation }) {
  const { userId, triggerRefresh } = useApp();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch } = useApi(getTasks, [userId]);

  const tasks = Array.isArray(data) ? data : [];
  const [local, setLocal] = useState(null);
  const list = local || tasks;

  // Reset local optimistic state when real data changes
  useEffect(() => { setLocal(null); }, [data]);

  const done = list.filter(t => t.is_completed).length;
  const pct = list.length ? Math.round((done / list.length) * 100) : 0;

  // ── Pull-to-refresh ────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    triggerRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }, [triggerRefresh]);

  // ── Toggle task ────────────────────────────────────────
  const toggle = useCallback(async (task) => {
    const newCompleted = !task.is_completed;
    const upd = list.map(t => t.id === task.id ? { ...t, is_completed: newCompleted } : t);
    setLocal(upd);
    try {
      await updateTask(task.id, { is_completed: newCompleted });
      triggerRefresh();
      toast.show(newCompleted ? 'Task completed 🎯' : 'Task marked incomplete', newCompleted ? 'success' : 'info');
    } catch {
      setLocal(null);
      toast.show('Failed to update task', 'error');
    }
  }, [list, triggerRefresh, toast]);

  // ── Loading ────────────────────────────────────────────
  const isFirstLoad = loading && !local && !data;
  if (isFirstLoad) return <View style={{ paddingTop: insets.top }}><ListSkeleton count={4} /></View>;
  if (error && !data) return <ErrorMessage message={error} onRetry={refetch} />;

  // ── Empty state ────────────────────────────────────────
  if (list.length === 0) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { alignItems: 'center', paddingTop: 60 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} colors={[COLORS.accent]} />}
        >
          <View style={styles.emptyIcon}>
            <Ionicons name="checkbox-outline" size={40} color={COLORS.accent} />
          </View>
          <Text style={[FONTS.h2, { marginTop: SPACING.lg, textAlign: 'center' }]}>No Tasks Yet</Text>
          <Text style={[FONTS.bodyMd, { color: COLORS.secondary, textAlign: 'center', marginTop: SPACING.sm, paddingHorizontal: SPACING.lg }]}>
            Tasks appear when you add study sessions or use "Fix Topic" from Insights.
          </Text>
          <TouchableOpacity style={styles.emptyCta} onPress={() => navigation.navigate('AddSession')} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.emptyCtaText}>Add a Session</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const incomplete = list.filter(t => !t.is_completed);
  const completed = list.filter(t => t.is_completed);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} colors={[COLORS.accent]} progressBackgroundColor={COLORS.card} />
        }
      >
        {/* Summary */}
        <Card style={{ marginBottom: SPACING.lg, gap: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={FONTS.h2}>Daily Focus</Text>
              <Text style={[FONTS.bodySm, { color: COLORS.onSurfaceVariant }]}>{done} of {list.length} tasks completed</Text>
            </View>
            <Text style={[FONTS.h3, { color: COLORS.accent }]}>{pct}%</Text>
          </View>
          <ProgressBar progress={pct} />
        </Card>

        {/* Pending */}
        {incomplete.length > 0 && (
          <>
            <View style={styles.catHead}><Text style={FONTS.labelCaps}>PENDING ({incomplete.length})</Text></View>
            {incomplete.map((t, i) => (
              <AnimatedTaskRow key={t.id} delay={i * 60}>
                <TaskItem title={t.title} category={t.subject} completed={t.is_completed} active onToggle={() => toggle(t)} />
              </AnimatedTaskRow>
            ))}
          </>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <View style={[styles.catHead, { marginTop: SPACING.md }]}><Text style={FONTS.labelCaps}>COMPLETED ({completed.length})</Text></View>
            {completed.map((t, i) => (
              <AnimatedTaskRow key={t.id} delay={i * 40}>
                <TaskItem title={t.title} category={t.subject} completed={t.is_completed} onToggle={() => toggle(t)} />
              </AnimatedTaskRow>
            ))}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 90 }]} onPress={() => navigation.navigate('AddSession')} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.containerPadding, paddingTop: SPACING.md },
  catHead: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: SPACING.cardGap },
  fab: { position: 'absolute', right: SPACING.lg, width: 56, height: 56, borderRadius: RADIUS.xl, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 25, elevation: 8 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accentLight, alignItems: 'center', justifyContent: 'center' },
  emptyCta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xl, backgroundColor: COLORS.accent, paddingHorizontal: SPACING.xl, height: 48, borderRadius: RADIUS.full },
  emptyCtaText: { ...FONTS.button, color: COLORS.primary },
});
