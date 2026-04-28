/**
 * AddSessionScreen — Add Study Session
 * Polished: accepts prefill params from "Start Now", shows toast on success.
 */
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { createSession } from '../services/api';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

const SUBJECTS = ['Advanced Mathematics', 'Neuroscience & Cognition', 'Theoretical Physics', 'Macroeconomics'];
const SESSION_TYPES = [
  { label: 'Study', value: 'study' },
  { label: 'Practice', value: 'practice' },
  { label: 'Revision', value: 'revision' },
];
const FOCUS_LEVELS = [
  { key: 'low', label: 'Low', icon: 'battery-dead-outline' },
  { key: 'medium', label: 'Medium', icon: 'battery-half-outline' },
  { key: 'high', label: 'High', icon: 'battery-full-outline' },
];

export default function AddSessionScreen({ navigation, route }) {
  const { userId, triggerRefresh } = useApp();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  // ── Prefill from "Start Now" navigation ────────────────
  const prefillSubject = route?.params?.prefillSubject || '';
  const prefillTopic = route?.params?.prefillTopic || '';

  const initialSubject = useMemo(() => {
    if (prefillSubject) {
      const match = SUBJECTS.find(s => s.toLowerCase().includes(prefillSubject.toLowerCase()));
      return match || SUBJECTS[0];
    }
    return SUBJECTS[0];
  }, [prefillSubject]);

  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState(prefillTopic);
  const [sessionType, setSessionType] = useState(prefillTopic ? 'revision' : 'study');
  const [duration, setDuration] = useState('');
  const [questions, setQuestions] = useState('');
  const [correct, setCorrect] = useState('');
  const [focusLevel, setFocusLevel] = useState('medium');
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleSave = async () => {
    if (!topic.trim()) { toast.show('Please enter a topic', 'error'); return; }
    const dur = parseInt(duration) || 0;
    if (dur <= 0) { toast.show('Please enter a valid duration', 'error'); return; }
    const q = parseInt(questions) || 0;
    const c = parseInt(correct) || 0;
    if (c > q) { toast.show('Correct answers cannot exceed questions attempted', 'error'); return; }

    setSaving(true);
    try {
      await createSession({
        user_id: userId,
        subject,
        topic: topic.trim(),
        session_type: sessionType,
        duration_minutes: dur,
        questions_attempted: q,
        correct_answers: c,
        focus_level: focusLevel,
      });
      triggerRefresh();
      toast.show('Session logged successfully ✅', 'success');
      setTimeout(() => navigation.goBack(), 600);
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Failed to save session.';
      toast.show(typeof detail === 'string' ? detail : 'Something went wrong', 'error');
    } finally { setSaving(false); }
  };

  return (
    <ScrollView style={[styles.root, { paddingTop: insets.top }]} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={FONTS.h3}>New Session</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={[FONTS.h2, { marginBottom: 4 }]}>New Study Session</Text>
      <Text style={[FONTS.bodySm, { color: COLORS.secondary, marginBottom: SPACING.lg }]}>Configure your focus sanctuary and begin.</Text>

      {/* Prefill notice */}
      {prefillTopic ? (
        <View style={styles.prefillBanner}>
          <Ionicons name="sparkles" size={16} color={COLORS.accent} />
          <Text style={styles.prefillText}>Pre-filled from your priority action</Text>
        </View>
      ) : null}

      {/* Subject */}
      <Text style={styles.fieldLabel}>SUBJECT</Text>
      <TouchableOpacity style={styles.select} onPress={() => setShowPicker(!showPicker)} activeOpacity={0.7}>
        <Text style={[FONTS.bodyMd, { color: COLORS.primary }]}>{subject}</Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.secondary} />
      </TouchableOpacity>
      {showPicker && (
        <Card style={{ padding: SPACING.sm, marginBottom: SPACING.md }}>
          {SUBJECTS.map(s => (
            <TouchableOpacity key={s} style={styles.pickItem} onPress={() => { setSubject(s); setShowPicker(false); }}>
              <Text style={[FONTS.bodyMd, s === subject && { fontFamily: 'Manrope-Bold', color: COLORS.accent }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* Topic */}
      <Text style={styles.fieldLabel}>TOPIC</Text>
      <TextInput style={styles.input} placeholder="e.g. Fourier Transform Analysis" placeholderTextColor={`${COLORS.secondary}80`} value={topic} onChangeText={setTopic} />

      {/* Session Type */}
      <Text style={styles.fieldLabel}>SESSION TYPE</Text>
      <View style={styles.chipRow}>
        {SESSION_TYPES.map(t => (
          <TouchableOpacity key={t.value} style={[styles.typeChip, t.value === sessionType && styles.typeChipActive]} onPress={() => setSessionType(t.value)}>
            <Text style={[styles.typeChipText, t.value === sessionType && styles.typeChipTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Duration */}
      <Text style={styles.fieldLabel}>DURATION (MINUTES)</Text>
      <TextInput style={styles.input} placeholder="e.g. 45" keyboardType="numeric" value={duration} onChangeText={setDuration} placeholderTextColor={`${COLORS.secondary}80`} />

      {/* Post-Session */}
      <Text style={[FONTS.h3, { marginBottom: SPACING.md }]}>Post-Session Analysis</Text>
      <View style={styles.postGrid}>
        <Card style={styles.postCard}>
          <Text style={styles.fieldLabel}>QUESTIONS</Text>
          <TextInput style={styles.postInput} placeholder="0" keyboardType="numeric" value={questions} onChangeText={setQuestions} placeholderTextColor={COLORS.secondary} />
        </Card>
        <Card style={styles.postCard}>
          <Text style={styles.fieldLabel}>CORRECT</Text>
          <TextInput style={styles.postInput} placeholder="0" keyboardType="numeric" value={correct} onChangeText={setCorrect} placeholderTextColor={COLORS.secondary} />
        </Card>
      </View>

      {/* Focus Level */}
      <Card style={{ marginBottom: SPACING.lg }}>
        <Text style={styles.fieldLabel}>FOCUS LEVEL</Text>
        <View style={styles.focusRow}>
          {FOCUS_LEVELS.map(f => (
            <TouchableOpacity key={f.key} style={[styles.focusBtn, f.key === focusLevel && styles.focusBtnActive]} onPress={() => setFocusLevel(f.key)}>
              <Ionicons name={f.icon} size={22} color={f.key === focusLevel ? COLORS.accent : COLORS.secondary} />
              <Text style={[styles.focusBtnText, f.key === focusLevel && { color: COLORS.accent }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Save */}
      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
        <Ionicons name={saving ? 'hourglass-outline' : 'checkmark-circle'} size={20} color={COLORS.primary} />
        <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Session'}</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.containerPadding, paddingTop: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  fieldLabel: { ...FONTS.labelCaps, color: COLORS.secondary, marginBottom: SPACING.sm, paddingHorizontal: 4 },
  select: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, height: 48, paddingHorizontal: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.md, ...SHADOWS.ambient },
  pickItem: { paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.sm },
  input: { backgroundColor: COLORS.card, height: 48, paddingHorizontal: SPACING.md, borderRadius: RADIUS.lg, ...FONTS.bodyMd, color: COLORS.primary, marginBottom: SPACING.md, ...SHADOWS.ambient },
  chipRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  typeChip: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.outlineVariant, alignItems: 'center' },
  typeChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  typeChipText: { ...FONTS.bodySm, fontFamily: 'Manrope-SemiBold', color: COLORS.secondary },
  typeChipTextActive: { color: COLORS.primary },
  postGrid: { flexDirection: 'row', gap: SPACING.cardGap, marginBottom: SPACING.md },
  postCard: { flex: 1, gap: SPACING.sm },
  postInput: { ...FONTS.h2, color: COLORS.primary, borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant, paddingBottom: 4 },
  focusRow: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.md, marginTop: SPACING.md },
  focusBtn: { flex: 1, alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.outlineVariant },
  focusBtnActive: { borderWidth: 2, borderColor: COLORS.accent, backgroundColor: 'rgba(200,169,126,0.05)' },
  focusBtnText: { ...FONTS.tiny, color: COLORS.secondary },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.accent, height: 56, borderRadius: RADIUS.lg, ...SHADOWS.lift },
  saveBtnText: { ...FONTS.button, color: COLORS.primary },
  prefillBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.accentLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, marginBottom: SPACING.lg, alignSelf: 'flex-start' },
  prefillText: { ...FONTS.bodySm, fontFamily: 'Manrope-SemiBold', color: COLORS.accent },
});
