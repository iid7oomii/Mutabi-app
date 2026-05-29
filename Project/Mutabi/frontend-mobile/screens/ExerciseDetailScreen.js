import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

function parseSteps(description = '') {
  // Try to split by numbered steps (1. 2. 3.) or by newlines
  const numbered = description.match(/\d+\.\s[^\d]*/g)
  if (numbered && numbered.length > 1) return numbered.map(s => s.replace(/^\d+\.\s*/, '').trim())
  const lines = description.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length > 1) return lines
  // Split long text into ~3 chunks by sentences
  const sentences = description.split('. ').filter(Boolean)
  return sentences.length > 1 ? sentences : [description]
}

export default function ExerciseDetailScreen() {
  const navigation = useNavigation()
  const route      = useRoute()
  const exercise   = route.params?.exercise || {}

  const steps = parseSteps(exercise.exercise_description || '')

  const stats = [
    { label: 'المدة',       value: exercise.duration_minutes ? `${exercise.duration_minutes} دقيقة` : '—' },
    { label: 'المجموعات',  value: exercise.reps ? `${exercise.reps}x` : '—' },
    { label: 'الشدة',       value: 'متوسطة' },
  ]

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{exercise.exercise_title || 'التمرين'}</Text>
        <TouchableOpacity style={styles.infoBtn}>
          <Ionicons name="information-circle-outline" size={22} color="#888" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Video Placeholder */}
        <View style={styles.videoBox}>
          <View style={styles.videoOverlay}>
            <TouchableOpacity style={styles.playBtn} activeOpacity={0.8}>
              <Ionicons name="play" size={28} color="#fff" style={{ marginLeft: 3 }} />
            </TouchableOpacity>
            <Text style={styles.videoTitle}>{exercise.exercise_title}</Text>
            <Text style={styles.videoDuration}>
              {exercise.duration_minutes ? `${exercise.duration_minutes}:00` : '—'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map(s => (
            <View key={s.label} style={styles.statItem}>
              <View style={styles.statIconWrap}>
                {s.label === 'المدة'      && <Ionicons name="time-outline" size={18} color={ORANGE} />}
                {s.label === 'المجموعات' && <Ionicons name="repeat-outline" size={18} color={ORANGE} />}
                {s.label === 'الشدة'      && <Ionicons name="pulse-outline" size={18} color={ORANGE} />}
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Step-by-step Guide */}
        <Text style={styles.sectionTitle}>دليل خطوة بخطوة</Text>
        <View style={styles.stepsContainer}>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>
                  {step.length < 30 ? step : `الخطوة ${i + 1}`}
                </Text>
                {step.length >= 30 && (
                  <Text style={styles.stepDesc}>{step}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Record Results Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.recordBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('LogSession', {
            planExerciseId: exercise.id,
            exerciseTitle:  exercise.exercise_title,
          })}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.recordBtnText}>تسجيل النتائج</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  infoBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  scroll: { paddingBottom: 20 },

  /* Video */
  videoBox: {
    backgroundColor: '#1a2a4a',
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlay: { alignItems: 'center', gap: 12 },
  playBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  videoTitle:    { color: '#fff', fontSize: 14, fontWeight: '600' },
  videoDuration: { color: '#ccc', fontSize: 12 },

  /* Stats */
  statsRow:    { flexDirection: 'row', justifyContent: 'space-around', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  statItem:    { alignItems: 'center', gap: 6 },
  statIconWrap:{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E8', alignItems: 'center', justifyContent: 'center' },
  statValue:   { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  statLabel:   { fontSize: 10, color: '#aaa', fontWeight: '600', letterSpacing: 0.5 },

  /* Steps */
  sectionTitle:    { fontSize: 16, fontWeight: '700', color: '#1a1a2e', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  stepsContainer:  { paddingHorizontal: 20, gap: 16 },
  stepRow:         { flexDirection: 'row', gap: 14 },
  stepNum:         { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF3E8', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  stepNumText:     { fontSize: 14, fontWeight: '700', color: ORANGE },
  stepContent:     { flex: 1, gap: 4 },
  stepTitle:       { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  stepDesc:        { fontSize: 13, color: '#666', lineHeight: 20 },

  /* Footer */
  footer:       { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  recordBtn:    { backgroundColor: BLUE, borderRadius: 12, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  recordBtnText:{ color: '#fff', fontSize: 16, fontWeight: '700' },
})
