import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { apiPost, saveSessionLocally, todayString } from '../utils/api'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

const COMPLETION_OPTIONS = [
  { key: 'completed',           label: 'Completed',  icon: 'checkmark-circle', color: '#2E7D32', bg: '#E8F5E9' },
  { key: 'partially_completed', label: 'Partial',    icon: 'radio-button-on',  color: '#E65100', bg: '#FFF3E8' },
  { key: 'skipped',             label: 'Skipped',    icon: 'close-circle',     color: '#B71C1C', bg: '#FFEBEE' },
]

const MOODS = ['😣', '😟', '😐', '😊', '😄']
// mood index 0 = very bad → pain 9, mood 4 = great → pain 1
const moodToPain = [9, 7, 5, 3, 1]

export default function LogSessionScreen() {
  const navigation = useNavigation()
  const route      = useRoute()
  const { planExerciseId, exerciseTitle } = route.params || {}

  const [completionStatus, setCompletionStatus] = useState('completed')
  const [moodIndex, setMoodIndex]               = useState(3)  // default: 😊
  const [notes, setNotes]                       = useState('')
  const [saving, setSaving]                     = useState(false)

  const handleSave = async () => {
    if (!planExerciseId) {
      Alert.alert('Error', 'Exercise ID is missing.')
      return
    }
    setSaving(true)
    try {
      const today = todayString()
      const body  = {
        plan_exercise_id: planExerciseId,
        feedback_date:    today,
        completion_status: completionStatus,
        pain_level:        moodToPain[moodIndex],
        parent_notes:      notes.trim() || null,
        parent_media_url:  null,
      }

      const res  = await apiPost('/feedback/', body)
      const json = await res.json()

      if (!res.ok) {
        Alert.alert('Error', json.error || 'Could not save session')
        return
      }

      // Save locally for Progress screen
      await saveSessionLocally({
        plan_exercise_id: planExerciseId,
        exercise_title:   exerciseTitle || 'Exercise',
        date:             today,
        completion_status: completionStatus,
        pain_level:        moodToPain[moodIndex],
        notes:             notes.trim(),
      })

      Alert.alert('Session Saved!', 'Great job logging today\'s session.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch {
      Alert.alert('Error', 'Could not connect to server')
    } finally {
      setSaving(false)
    }
  }

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Session</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Exercise Info */}
          <View style={styles.exerciseInfoCard}>
            <View style={styles.exerciseTag}>
              <Text style={styles.exerciseTagText}>SPEECH THERAPY</Text>
            </View>
            <Text style={styles.exerciseTitle}>{exerciseTitle || 'Exercise'}</Text>
            <View style={styles.exerciseTime}>
              <Ionicons name="calendar-outline" size={13} color="#888" />
              <Text style={styles.exerciseTimeText}>Today, {timeStr}</Text>
            </View>
          </View>

          {/* Completion Status */}
          <Text style={styles.sectionLabel}>Completion Status</Text>
          <View style={styles.completionOptions}>
            {COMPLETION_OPTIONS.map(opt => {
              const isActive = completionStatus === opt.key
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.completionOption,
                    isActive && { backgroundColor: opt.bg, borderColor: opt.color },
                  ]}
                  onPress={() => setCompletionStatus(opt.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt.icon}
                    size={28}
                    color={isActive ? opt.color : '#ccc'}
                  />
                  <Text style={[styles.completionLabel, isActive && { color: opt.color }]}>
                    {opt.label}
                  </Text>
                  {isActive && (
                    <View style={[styles.checkMark, { backgroundColor: opt.color }]}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Child's Mood */}
          <Text style={styles.sectionLabel}>Child's Mood</Text>
          <View style={styles.moodRow}>
            {MOODS.map((emoji, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setMoodIndex(i)}
                style={[styles.moodBtn, i === moodIndex && styles.moodBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
                {i === moodIndex && (
                  <Text style={styles.moodActiveLabel}>
                    {['Bad', 'Low', 'Okay', 'Good', 'Great'][i]}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Parent Notes */}
          <Text style={styles.sectionLabel}>Parent Notes <Text style={styles.optional}>(Optional)</Text></Text>
          <TextInput
            style={styles.notesInput}
            placeholder="How did it go? Note any challenges, breakthroughs, or specific observations..."
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />

          {/* Photos / Videos */}
          <Text style={styles.sectionLabel}>Photos or Videos <Text style={styles.optional}>(Optional)</Text></Text>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => Alert.alert('Coming Soon', 'Media upload will be available in the next update.')}
          >
            <Ionicons name="camera-outline" size={32} color="#aaa" />
            <Text style={styles.uploadTitle}>Add progress media</Text>
            <Text style={styles.uploadSub}>Capture breakthroughs or techniques</Text>
            <View style={styles.uploadBtn}>
              <Ionicons name="cloud-upload-outline" size={16} color={BLUE} />
              <Text style={styles.uploadBtnText}>Upload Media</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={styles.saveBtnText}>Save Session</Text>
                  <Ionicons name="save-outline" size={18} color="#fff" />
                </>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  closeBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },

  scroll: { padding: 20, paddingBottom: 16 },

  /* Exercise info */
  exerciseInfoCard: { backgroundColor: '#f8f9fb', borderRadius: 14, padding: 16, marginBottom: 24 },
  exerciseTag:      { backgroundColor: '#EEF3FA', alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  exerciseTagText:  { fontSize: 10, color: BLUE, fontWeight: '700', letterSpacing: 0.5 },
  exerciseTitle:    { fontSize: 17, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  exerciseTime:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  exerciseTimeText: { fontSize: 12, color: '#888' },

  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  optional:     { fontWeight: '400', color: '#aaa' },

  /* Completion */
  completionOptions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  completionOption:  { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e8e8e8', gap: 6, position: 'relative' },
  completionLabel:   { fontSize: 13, fontWeight: '600', color: '#aaa' },
  checkMark:         { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  /* Mood */
  moodRow:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  moodBtn:        { alignItems: 'center', width: 52, height: 52, borderRadius: 26, justifyContent: 'center' },
  moodBtnActive:  { backgroundColor: '#EEF3FA', height: 68, borderRadius: 34 },
  moodEmoji:      { fontSize: 26 },
  moodActiveLabel:{ fontSize: 10, color: BLUE, fontWeight: '600', marginTop: 2 },

  /* Notes */
  notesInput: { borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 12, padding: 14, fontSize: 14, color: '#333', minHeight: 100, marginBottom: 24, backgroundColor: '#fafafa' },

  /* Upload */
  uploadBox:      { borderWidth: 1, borderColor: '#e8e8e8', borderStyle: 'dashed', borderRadius: 12, padding: 24, alignItems: 'center', gap: 6, marginBottom: 8, backgroundColor: '#fafafa' },
  uploadTitle:    { fontSize: 14, fontWeight: '600', color: '#444' },
  uploadSub:      { fontSize: 12, color: '#aaa' },
  uploadBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, borderWidth: 1, borderColor: BLUE, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  uploadBtnText:  { fontSize: 13, color: BLUE, fontWeight: '600' },

  /* Footer */
  footer:       { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  saveBtn:      { backgroundColor: ORANGE, borderRadius: 12, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
})
