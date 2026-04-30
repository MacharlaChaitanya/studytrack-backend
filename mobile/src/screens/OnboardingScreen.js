/**
 * OnboardingScreen — Collect name, target exam, daily goal
 * Fast (<30 sec), minimal, saves to users table via backend API.
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Animated, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { upsertUserProfile } from '../services/api';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

const EXAM_OPTIONS = ['JEE', 'NEET', 'GATE', 'CAT', 'UPSC', 'GRE', 'Other'];
const GOAL_OPTIONS = [
  { label: '2h', value: 2, icon: 'leaf-outline' },
  { label: '4h', value: 4, icon: 'flame-outline' },
  { label: '6h', value: 6, icon: 'rocket-outline' },
  { label: '8h+', value: 8, icon: 'flash-outline' },
];

export default function OnboardingScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0); // 0 = name, 1 = exam, 2 = goal
  const [name, setName] = useState('');
  const [exam, setExam] = useState('');
  const [goal, setGoal] = useState(4);
  const [loading, setLoading] = useState(false);

  // Fade-in per step
  const opacity = useRef(new Animated.Value(1)).current;
  const animateStep = () => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const nextStep = () => {
    if (step === 0 && !name.trim()) {
      toast.show('Please enter your name', 'error');
      return;
    }
    if (step === 1 && !exam) {
      toast.show('Please select a target exam', 'error');
      return;
    }
    animateStep();
    setStep(step + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await upsertUserProfile({
        id: user.id,
        email: user.email,
        name: name.trim(),
        target_exam: exam,
        daily_goal_hours: goal,
      });
      toast.show('Welcome to Sphere! 🎉', 'success');
      // Navigation happens automatically via AppContext detecting onboarded state
    } catch (err) {
      toast.show(err.message || 'Failed to save profile', 'error');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top + 20 }]}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      {/* Progress */}
      <View style={styles.progressRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
        ))}
      </View>

      <Animated.View style={{ opacity }}>
        {/* ── STEP 0: Name ──────────────────────────────── */}
        {step === 0 && (
          <View>
            <View style={styles.iconRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={32} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.stepTitle}>What's your name?</Text>
            <Text style={styles.stepSub}>We'll personalize your experience.</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={`${COLORS.secondary}80`}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={nextStep}
            />
            <TouchableOpacity style={styles.nextBtn} onPress={nextStep} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 1: Target Exam ───────────────────────── */}
        {step === 1 && (
          <View>
            <View style={styles.iconRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="school-outline" size={32} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.stepTitle}>What are you preparing for?</Text>
            <Text style={styles.stepSub}>Select your target exam.</Text>
            <View style={styles.chipGrid}>
              {EXAM_OPTIONS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[styles.examChip, exam === e && styles.examChipActive]}
                  onPress={() => setExam(e)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.examChipText, exam === e && styles.examChipTextActive]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={nextStep} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 2: Daily Goal ────────────────────────── */}
        {step === 2 && (
          <View>
            <View style={styles.iconRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="timer-outline" size={32} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.stepTitle}>Set your daily goal</Text>
            <Text style={styles.stepSub}>How many hours do you want to study each day?</Text>
            <View style={styles.goalRow}>
              {GOAL_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.goalCard, goal === g.value && styles.goalCardActive]}
                  onPress={() => setGoal(g.value)}
                  activeOpacity={0.75}
                >
                  <Ionicons name={g.icon} size={24} color={goal === g.value ? COLORS.accent : COLORS.secondary} />
                  <Text style={[styles.goalLabel, goal === g.value && { color: COLORS.accent, fontFamily: 'Manrope-Bold' }]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.nextBtn, styles.finishBtn, loading && { opacity: 0.6 }]}
              onPress={handleComplete}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Text style={styles.nextBtnText}>Start Learning</Text>
                  <Ionicons name="rocket" size={18} color={COLORS.primary} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.containerPadding, paddingBottom: 40 },
  // Progress
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.outlineVariant },
  progressDotActive: { width: 24, backgroundColor: COLORS.accent },
  // Step shared
  iconRow: { alignItems: 'center', marginBottom: SPACING.lg },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.lift,
  },
  stepTitle: { fontFamily: 'Manrope-ExtraBold', fontSize: 24, color: COLORS.primary, textAlign: 'center' },
  stepSub: { fontFamily: 'Manrope-Medium', fontSize: 14, color: COLORS.secondary, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.xl },
  input: {
    backgroundColor: COLORS.card, height: 56, paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg, fontFamily: 'Manrope-Medium', fontSize: 16,
    color: COLORS.primary, ...SHADOWS.ambient, textAlign: 'center',
  },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.accent, height: 56, borderRadius: RADIUS.full, marginTop: SPACING.xl, ...SHADOWS.lift,
  },
  finishBtn: { marginTop: SPACING.lg },
  nextBtnText: { fontFamily: 'Manrope-Bold', fontSize: 16, color: COLORS.primary },
  // Exam chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' },
  examChip: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.card,
  },
  examChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  examChipText: { fontFamily: 'Manrope-SemiBold', fontSize: 14, color: COLORS.secondary },
  examChipTextActive: { color: COLORS.primary },
  // Goal
  goalRow: { flexDirection: 'row', gap: SPACING.cardGap, justifyContent: 'center' },
  goalCard: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.lg, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.outlineVariant,
    gap: SPACING.sm, ...SHADOWS.ambient,
  },
  goalCardActive: { borderColor: COLORS.accent, backgroundColor: 'rgba(200,169,126,0.08)' },
  goalLabel: { fontFamily: 'Manrope-SemiBold', fontSize: 14, color: COLORS.secondary },
});
