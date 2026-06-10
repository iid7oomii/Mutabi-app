import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { VideoView, useVideoPlayer } from 'expo-video'
import { getLocalSessions, todayString } from '../utils/api'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'
const GREEN  = '#2E7D32'

const MOODS = [
  { icon: 'sad-sharp',             color: '#B71C1C', bg: '#FFEBEE', label: 'سيء جداً', pain: 9 },
  { icon: 'sad-outline',           color: '#E65100', bg: '#FFF3E8', label: 'سيء',      pain: 7 },
  { icon: 'remove-circle-outline', color: '#888',    bg: '#F5F5F5', label: 'عادي',     pain: 5 },
  { icon: 'happy-outline',         color: '#1565C0', bg: '#EEF3FA', label: 'جيد',      pain: 3 },
  { icon: 'happy',                 color: GREEN,     bg: '#E8F5E9', label: 'ممتاز',    pain: 1 },
]

const COMPLETION_LABELS = {
  completed:           { label: 'مكتمل',     icon: 'checkmark-circle', color: GREEN,    bg: '#E8F5E9' },
  partially_completed: { label: 'جزئي',      icon: 'radio-button-on',  color: '#E65100', bg: '#FFF3E8' },
  skipped:             { label: 'تم التخطي', icon: 'close-circle',     color: '#B71C1C', bg: '#FFEBEE' },
}

const DIFF_LABELS = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' }
const DIFF_COLORS = { easy: '#2E7D32', medium: '#E65100', hard: '#B71C1C' }
const DIFF_BG     = { easy: '#E8F5E9', medium: '#FFF3E8', hard: '#FFEBEE' }

export default function ExerciseDetailScreen() {
  const navigation  = useNavigation()
  const route       = useRoute()
  const exercise    = route.params?.exercise || {}
  const isCompleted = route.params?.isCompleted || false

  const [session, setSession]           = useState(null)
  const [loadingSession, setLoadingSession] = useState(isCompleted)
  const [videoVisible, setVideoVisible] = useState(false)

  useEffect(() => {
    if (exercise.exercise_title) {
      navigation.setOptions({ title: `${exercise.exercise_title} | متابع` })
    }
  }, [exercise.exercise_title])

  const videoPlayer = useVideoPlayer(exercise.exercise_media_url || null, player => {
    player.loop = false
  })

  useEffect(() => {
    if (!isCompleted) return
    getLocalSessions().then(sessions => {
      const today = todayString()
      const found = sessions.find(
        s => s.plan_exercise_id === exercise.id && s.date === today
      )
      setSession(found || null)
      setLoadingSession(false)
    })
  }, [isCompleted, exercise.id])

  const openVideo = () => {
    setVideoVisible(true)
    videoPlayer.play()
  }

  const closeVideo = () => {
    videoPlayer.pause()
    setVideoVisible(false)
  }

  /* Parse steps_json if available */
  const steps = (() => {
    if (exercise.exercise_steps_json) {
      try { return JSON.parse(exercise.exercise_steps_json) } catch { /* fall through */ }
    }
    return null
  })()

  const diff = exercise.exercise_difficulty
  const moodObj = session ? MOODS.find(m => m.pain === session.pain_level) : null
  const completionObj = session ? COMPLETION_LABELS[session.completion_status] : null

  const stats = [
    { label: 'المدة',      value: exercise.duration_minutes ? `${exercise.duration_minutes} دق` : '—',    icon: 'time-outline' },
    { label: 'التكرار',   value: exercise.reps ? `${exercise.reps}×` : '—',                              icon: 'repeat-outline' },
    { label: 'الشدة',     value: diff ? DIFF_LABELS[diff] : '—',                                         icon: 'pulse-outline',
      valueColor: diff ? DIFF_COLORS[diff] : '#1a1a2e', valueBg: diff ? DIFF_BG[diff] : undefined },
  ]

  if (isCompleted && loadingSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={BLUE} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Video Modal */}
      {exercise.exercise_media_url ? (
        <Modal
          visible={videoVisible}
          animationType="slide"
          onRequestClose={closeVideo}
          statusBarTranslucent
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalClose} onPress={closeVideo}>
              <Ionicons name="close-circle" size={34} color="#fff" />
            </TouchableOpacity>
            <VideoView
              player={videoPlayer}
              style={styles.videoPlayer}
              contentFit="contain"
              allowsFullscreen
              allowsPictureInPicture
            />
            <Text style={styles.modalTitle} numberOfLines={2}>
              {exercise.exercise_title}
            </Text>
          </View>
        </Modal>
      ) : null}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{exercise.exercise_title || 'التمرين'}</Text>
        {isCompleted ? (
          <View style={[styles.completedBadge]}>
            <Ionicons name="checkmark-circle" size={14} color={GREEN} />
            <Text style={styles.completedBadgeText}>مكتمل</Text>
          </View>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Media / Icon Placeholder */}
        <View style={[styles.videoBox, isCompleted && styles.videoBoxCompleted]}>
          <View style={styles.videoOverlay}>
            <View style={styles.exerciseIconCircle}>
              <Ionicons name={exercise.exercise_icon || 'fitness-outline'} size={40} color="#fff" />
            </View>
            <Text style={styles.videoTitle}>{exercise.exercise_title}</Text>
            {exercise.exercise_goal ? (
              <View style={styles.goalBadge}>
                <Text style={styles.goalBadgeText}>{exercise.exercise_goal}</Text>
              </View>
            ) : null}
            {exercise.exercise_media_url ? (
              <TouchableOpacity
                style={styles.watchBtn}
                onPress={openVideo}
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle" size={18} color={BLUE} />
                <Text style={styles.watchBtnText}>شاهد الفيديو التوضيحي</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map(s => (
            <View key={s.label} style={styles.statItem}>
              <View style={styles.statIconWrap}>
                <Ionicons name={s.icon} size={18} color={ORANGE} />
              </View>
              {s.valueBg ? (
                <View style={[styles.statValueBadge, { backgroundColor: s.valueBg }]}>
                  <Text style={[styles.statValue, { color: s.valueColor }]}>{s.value}</Text>
                </View>
              ) : (
                <Text style={styles.statValue}>{s.value}</Text>
              )}
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Steps or Description */}
        {steps ? (
          <>
            <Text style={styles.sectionTitle}>دليل خطوة بخطوة</Text>
            <View style={styles.stepsContainer}>
              {steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepDesc}>{step}</Text>
                </View>
              ))}
            </View>
          </>
        ) : exercise.exercise_description ? (
          <>
            <Text style={styles.sectionTitle}>وصف التمرين</Text>
            <View style={styles.descCard}>
              <Text style={styles.descText}>{exercise.exercise_description}</Text>
            </View>
          </>
        ) : null}

        {/* Read-only Session Review (when completed) */}
        {isCompleted && (
          <>
            <Text style={styles.sectionTitle}>نتيجة الجلسة</Text>
            <View style={styles.sessionCard}>
              {completionObj && (
                <View style={[styles.sessionRow, { backgroundColor: completionObj.bg, borderRadius: 10, padding: 12, marginBottom: 12 }]}>
                  <Ionicons name={completionObj.icon} size={22} color={completionObj.color} />
                  <Text style={[styles.sessionRowLabel, { color: completionObj.color, fontWeight: '700' }]}>
                    {completionObj.label}
                  </Text>
                </View>
              )}

              {moodObj && (
                <View style={styles.sessionRow}>
                  <View style={[styles.moodIconWrap, { backgroundColor: moodObj.bg }]}>
                    <Ionicons name={moodObj.icon} size={20} color={moodObj.color} />
                  </View>
                  <View>
                    <Text style={styles.sessionRowHint}>مزاج الطفل</Text>
                    <Text style={[styles.sessionRowLabel, { color: moodObj.color }]}>{moodObj.label}</Text>
                  </View>
                </View>
              )}

              {session?.notes ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sessionRowHint}>ملاحظات الوالد</Text>
                  <Text style={styles.sessionNotes}>{session.notes}</Text>
                </>
              ) : null}

              {!session && (
                <Text style={styles.noSessionText}>لا توجد بيانات جلسة محلية</Text>
              )}
            </View>
          </>
        )}

      </ScrollView>

      {/* Footer Button */}
      {!isCompleted && (
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
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },

  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  modalClose:     { position: 'absolute', top: 52, right: 16, zIndex: 10 },
  videoPlayer:    { width: '100%', height: 300 },
  modalTitle:     { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center', paddingHorizontal: 24, marginTop: 20, opacity: 0.85 },

  header:              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn:             { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:         { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  completedBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  completedBadgeText:  { fontSize: 11, fontWeight: '700', color: '#2E7D32' },

  scroll: { paddingBottom: 24 },

  videoBox:          { backgroundColor: '#1a2a4a', height: 200, justifyContent: 'center', alignItems: 'center' },
  videoBoxCompleted: { backgroundColor: '#0d3320' },
  videoOverlay:      { alignItems: 'center', gap: 10 },
  exerciseIconCircle:{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  videoTitle:        { color: '#fff', fontSize: 15, fontWeight: '700' },
  goalBadge:         { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  goalBadgeText:     { color: '#fff', fontSize: 11, fontWeight: '600' },
  watchBtn:          { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  watchBtnText:      { fontSize: 13, fontWeight: '700', color: BLUE },

  statsRow:       { flexDirection: 'row', justifyContent: 'space-around', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  statItem:       { alignItems: 'center', gap: 6 },
  statIconWrap:   { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E8', alignItems: 'center', justifyContent: 'center' },
  statValue:      { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  statValueBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  statLabel:      { fontSize: 10, color: '#aaa', fontWeight: '600', letterSpacing: 0.5 },

  sectionTitle:   { fontSize: 15, fontWeight: '700', color: '#1a1a2e', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  stepsContainer: { paddingHorizontal: 20, gap: 14 },
  stepRow:        { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum:        { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF3E8', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText:    { fontSize: 13, fontWeight: '700', color: ORANGE },
  stepDesc:       { flex: 1, fontSize: 13, color: '#444', lineHeight: 20, paddingTop: 4 },

  descCard:       { marginHorizontal: 20, backgroundColor: '#f8f9fb', borderRadius: 12, padding: 16 },
  descText:       { fontSize: 13, color: '#444', lineHeight: 22 },

  sessionCard:       { marginHorizontal: 20, backgroundColor: '#f8f9fb', borderRadius: 14, padding: 16, gap: 8 },
  sessionRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionRowHint:    { fontSize: 10, color: '#aaa', fontWeight: '600', marginBottom: 2 },
  sessionRowLabel:   { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  moodIconWrap:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  divider:           { height: 1, backgroundColor: '#ececec', marginVertical: 4 },
  sessionNotes:      { fontSize: 13, color: '#555', lineHeight: 20 },
  noSessionText:     { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 8 },

  footer:        { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  recordBtn:     { backgroundColor: BLUE, borderRadius: 12, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  recordBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
