import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Header from '../components/Header'
import { apiGet, getLocalSessions, todayString } from '../utils/api'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ICONS = ['mic-outline', 'happy-outline', 'walk-outline', 'musical-notes-outline', 'fitness-outline', 'eye-outline']
const ICON_BG = ['#EEF3FA', '#FFF3E8', '#F0FFF4', '#F5F0FF', '#FFF0F0', '#F0FAFF']

function getWeekDates() {
  const today = new Date()
  const dayOfWeek = (today.getDay() + 6) % 7 // 0=Mon … 6=Sun
  return DAY_LABELS.map((label, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    return { label, date: d.getDate(), isToday: i === dayOfWeek }
  })
}

function StatusBadge({ status }) {
  const configs = {
    completed: { bg: '#E8F5E9', color: '#2E7D32', label: '✓ Completed' },
    upcoming:  { bg: '#FFF3E8', color: ORANGE,    label: 'Up Next' },
    pending:   { bg: '#F5F5F5', color: '#888',    label: 'Pending' },
    bonus:     { bg: '#EEF3FA', color: BLUE,      label: 'Bonus' },
  }
  const c = configs[status] || configs.pending
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  )
}

export default function TherapyScreen({ onTabPress, activeTab }) {
  const navigation = useNavigation()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [completed, setCompleted] = useState([]) // plan_exercise_ids completed today

  const weekDates = getWeekDates()

  const fetchData = async () => {
    try {
      const res  = await apiGet('/dashboard/parent')
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Error'); return }
      setData(json)
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  // Reload completed sessions when Therapy tab becomes active
  useEffect(() => {
    if (activeTab === 'Therapy') loadCompleted()
  }, [activeTab])

  const loadCompleted = async () => {
    const sessions = await getLocalSessions()
    const today = todayString()
    const ids = sessions
      .filter(s => s.date === today && s.completion_status === 'completed')
      .map(s => s.plan_exercise_id)
    setCompleted(ids)
  }

  useEffect(() => { fetchData() }, [])

  const getStatus = (exercise, index) => {
    if (completed.includes(exercise.id)) return 'completed'
    const firstPending = (data?.today_exercises || []).findIndex(e => !completed.includes(e.id))
    if (index === firstPending) return 'upcoming'
    if (index > (data?.today_exercises?.length - 1) * 0.75) return 'bonus'
    return 'pending'
  }

  const getActionLabel = status => {
    if (status === 'completed') return 'Review'
    if (status === 'upcoming')  return 'Start Now'
    return 'View Details'
  }

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={BLUE} size="large" />
    </View>
  )

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  )

  const exercises = data?.today_exercises || []

  return (
    <View style={{ flex: 1 }}>
      <Header
        clinicName={data?.clinic_name}
        onBellPress={() => navigation.navigate('Notifications')}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Title */}
        <Text style={styles.title}>Daily Exercises</Text>
        <Text style={styles.subtitle}>
          {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} assigned for today
        </Text>

        {/* Week Calendar */}
        <View style={styles.calendar}>
          {weekDates.map(({ label, date, isToday }) => (
            <View key={label} style={styles.dayCol}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{label}</Text>
              <View style={[styles.dayCircle, isToday && styles.dayCircleToday]}>
                <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>{date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Exercise Cards */}
        {exercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={32} color="#aaa" />
            <Text style={styles.emptyText}>No exercises for today</Text>
          </View>
        ) : (
          exercises.map((ex, i) => {
            const status = getStatus(ex, i)
            const isUpcoming = status === 'upcoming'
            return (
              <TouchableOpacity
                key={ex.id}
                style={[styles.card, isUpcoming && styles.cardHighlight]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ExerciseDetail', { exercise: ex })}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconWrap, { backgroundColor: ICON_BG[i % ICON_BG.length] }]}>
                    <Ionicons name={ICONS[i % ICONS.length]} size={22} color={BLUE} />
                  </View>
                  <StatusBadge status={status} />
                </View>

                <Text style={[styles.cardTitle, isUpcoming && styles.cardTitleWhite]}>
                  {ex.exercise_title}
                </Text>
                <Text style={[styles.cardDesc, isUpcoming && styles.cardDescWhite]} numberOfLines={2}>
                  {ex.exercise_description}
                </Text>

                <View style={styles.cardFooter}>
                  {ex.duration_minutes ? (
                    <View style={styles.durationRow}>
                      <Ionicons name="time-outline" size={13} color={isUpcoming ? '#fff' : '#888'} />
                      <Text style={[styles.durationText, isUpcoming && { color: '#eee' }]}>
                        {ex.duration_minutes} mins
                      </Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.actionBtn, status === 'completed' && styles.actionBtnGrey]}
                    onPress={() => {
                      if (status === 'completed') return
                      navigation.navigate('ExerciseDetail', { exercise: ex })
                    }}
                  >
                    <Text style={[styles.actionText, status === 'completed' && { color: '#555' }]}>
                      {getActionLabel(status)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText:       { color: '#dc2626', fontSize: 14 },
  scroll:          { padding: 20, paddingBottom: 24 },
  title:           { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  subtitle:        { fontSize: 13, color: '#888', marginBottom: 20 },

  /* Calendar */
  calendar:        { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  dayCol:          { alignItems: 'center', gap: 6 },
  dayLabel:        { fontSize: 11, color: '#aaa', fontWeight: '600' },
  dayLabelToday:   { color: ORANGE },
  dayCircle:       { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayCircleToday:  { backgroundColor: ORANGE },
  dayNum:          { fontSize: 13, color: '#555', fontWeight: '600' },
  dayNumToday:     { color: '#fff' },

  /* Cards */
  card:            { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHighlight:   { backgroundColor: BLUE },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  iconWrap:        { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badge:           { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:       { fontSize: 11, fontWeight: '700' },
  cardTitle:       { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  cardTitleWhite:  { color: '#fff' },
  cardDesc:        { fontSize: 13, color: '#888', lineHeight: 18, marginBottom: 12 },
  cardDescWhite:   { color: '#cce0ff' },
  cardFooter:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  durationRow:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  durationText:    { fontSize: 12, color: '#888' },
  actionBtn:       { backgroundColor: ORANGE, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  actionBtnGrey:   { backgroundColor: '#f0f0f0' },
  actionText:      { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyCard:       { alignItems: 'center', padding: 40, gap: 12 },
  emptyText:       { color: '#aaa', fontSize: 14 },
})
