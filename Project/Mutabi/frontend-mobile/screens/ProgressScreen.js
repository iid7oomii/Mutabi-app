import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Header from '../components/Header'
import { apiGet, getLocalSessions } from '../utils/api'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

const FILTERS   = ['This Week', 'This Month', '3 Months']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekStart() {
  const d = new Date()
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function dateStr(d) {
  return d.toISOString().split('T')[0]
}

function calcStreak(sessions) {
  let streak = 0
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  for (let i = 0; i < 90; i++) {
    const ds = dateStr(d)
    const hit = sessions.some(s => s.date === ds && s.completion_status === 'completed')
    if (!hit && i > 0) break
    if (hit) streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

function getSessionTag(s) {
  if (s.completion_status === 'completed' && s.pain_level <= 2) return { label: 'Breakthrough', bg: '#FFF3E8', color: ORANGE }
  if (s.completion_status === 'completed')                       return { label: 'Completed',   bg: '#E8F5E9', color: '#2E7D32' }
  if (s.completion_status === 'partially_completed')            return { label: 'Review',       bg: '#EEF3FA', color: BLUE }
  return { label: 'Skipped', bg: '#FFEBEE', color: '#B71C1C' }
}

function ConsistencyChart({ weekData, todayIdx }) {
  const max = Math.max(...weekData, 1)
  return (
    <View style={chartStyles.wrapper}>
      {weekData.map((val, i) => {
        const heightPct = max > 0 ? (val / max) : 0
        const isToday = i === todayIdx
        return (
          <View key={i} style={chartStyles.col}>
            <View style={chartStyles.track}>
              <View style={[
                chartStyles.bar,
                { height: `${Math.max(heightPct * 100, val > 0 ? 10 : 3)}%` },
                isToday ? chartStyles.barToday : chartStyles.barNormal,
              ]} />
            </View>
            <Text style={[chartStyles.dayLabel, isToday && chartStyles.dayLabelToday]}>
              {DAY_LABELS[i]}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const chartStyles = StyleSheet.create({
  wrapper:       { flexDirection: 'row', height: 100, alignItems: 'flex-end', gap: 6, marginTop: 8 },
  col:           { flex: 1, alignItems: 'center', gap: 6 },
  track:         { flex: 1, width: '100%', justifyContent: 'flex-end', backgroundColor: '#f5f5f5', borderRadius: 4 },
  bar:           { width: '100%', borderRadius: 4 },
  barNormal:     { backgroundColor: '#c7d8f5' },
  barToday:      { backgroundColor: BLUE },
  dayLabel:      { fontSize: 10, color: '#aaa' },
  dayLabelToday: { color: BLUE, fontWeight: '700' },
})

export default function ProgressScreen({ activeTab }) {
  const navigation                = useNavigation()
  const [filter, setFilter]       = useState('This Week')
  const [sessions, setSessions]   = useState([])
  const [clinicName, setClinicName] = useState('')
  const [loading, setLoading]     = useState(true)

  useEffect(() => { loadData() }, [])

  // Reload when Progress tab becomes active
  useEffect(() => {
    if (activeTab === 'Progress') loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const [localSessions, dashRes] = await Promise.all([
        getLocalSessions(),
        apiGet('/dashboard/parent'),
      ])
      setSessions(localSessions)
      const dash = await dashRes.json()
      setClinicName(dash.clinic_name || '')
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  // Build weekly bar data (0 = Mon … 6 = Sun)
  const todayIdx   = (new Date().getDay() + 6) % 7
  const weekStart  = getWeekStart()
  const weekData   = DAY_LABELS.map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const ds = dateStr(d)
    return sessions.filter(s => s.date === ds && s.completion_status === 'completed').length
  })

  const streak     = calcStreak(sessions)
  const totalDone  = sessions.filter(s => s.completion_status === 'completed').length

  // Recent sessions (last 20, newest first)
  const recent = [...sessions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 20)

  return (
    <View style={{ flex: 1 }}>
      <Header
        clinicName={clinicName}
        onBellPress={() => navigation.navigate('Notifications')}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.title}>Progress Timeline</Text>
        <Text style={styles.subtitle}>Track your therapy journey and milestones.</Text>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={BLUE} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Consistency Trend */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Consistency Trend</Text>
                <View style={styles.onTrackBadge}>
                  <Text style={styles.onTrackText}>🔥 On Track</Text>
                </View>
              </View>
              <ConsistencyChart weekData={weekData} todayIdx={todayIdx} />
            </View>

            {/* Streak */}
            <View style={styles.streakCard}>
              <Ionicons name="time-outline" size={20} color="#ccc" />
              <Text style={styles.streakSub}>Current Streak</Text>
              <Text style={styles.streakNum}>{streak} Days</Text>
              <Text style={styles.streakMsg}>
                {streak > 0 ? "You're building a strong habit. Keep going!" : 'Start logging sessions to build your streak!'}
              </Text>
            </View>

            {/* Sessions Completed */}
            <View style={styles.sessionsCard}>
              <View>
                <Text style={styles.sessionsLabel}>Sessions Completed</Text>
                <Text style={styles.sessionsNum}>{totalDone}</Text>
              </View>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark-circle-outline" size={28} color={BLUE} />
              </View>
            </View>

            {/* Recent Sessions */}
            <Text style={styles.recentTitle}>Recent Sessions</Text>
            {recent.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="journal-outline" size={36} color="#ccc" />
                <Text style={styles.emptyText}>No sessions logged yet.</Text>
                <Text style={styles.emptySubText}>Complete exercises and log results to see them here.</Text>
              </View>
            ) : (
              recent.map((s, i) => {
                const tag  = getSessionTag(s)
                const date = new Date(s.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                return (
                  <View key={i} style={styles.sessionItem}>
                    {/* Status dot */}
                    <View style={[styles.sessionDot, { backgroundColor: tag.color }]}>
                      <Ionicons
                        name={s.completion_status === 'completed' ? 'checkmark' : s.completion_status === 'skipped' ? 'close' : 'remove'}
                        size={14} color="#fff"
                      />
                    </View>
                    <View style={styles.sessionContent}>
                      <View style={[styles.sessionTag, { backgroundColor: tag.bg }]}>
                        <Text style={[styles.sessionTagText, { color: tag.color }]}>{tag.label}</Text>
                      </View>
                      <View style={styles.sessionDateRow}>
                        <Ionicons name="calendar-outline" size={11} color="#aaa" />
                        <Text style={styles.sessionDate}>{date}</Text>
                      </View>
                      <Text style={styles.sessionTitle}>{s.exercise_title}</Text>
                      {s.notes ? <Text style={styles.sessionNotes} numberOfLines={2}>{s.notes}</Text> : null}
                    </View>
                  </View>
                )
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  scroll:   { padding: 20, paddingBottom: 24 },
  title:    { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 20 },

  /* Filters */
  filterRow:      { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterBtn:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f5f5f5' },
  filterBtnActive:{ backgroundColor: BLUE },
  filterText:     { fontSize: 13, color: '#888', fontWeight: '500' },
  filterTextActive:{ color: '#fff', fontWeight: '600' },

  /* Consistency chart card */
  card:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeaderRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:      { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  onTrackBadge:   { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  onTrackText:    { fontSize: 12, color: '#2E7D32', fontWeight: '600' },

  /* Streak */
  streakCard:  { backgroundColor: '#0F4C81', borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'flex-start', gap: 4 },
  streakSub:   { fontSize: 13, color: '#cce0ff' },
  streakNum:   { fontSize: 36, fontWeight: '700', color: '#fff' },
  streakMsg:   { fontSize: 13, color: '#cce0ff', lineHeight: 18 },

  /* Sessions completed */
  sessionsCard:  { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sessionsLabel: { fontSize: 13, color: '#888', marginBottom: 4 },
  sessionsNum:   { fontSize: 32, fontWeight: '700', color: '#1a1a2e' },
  checkCircle:   { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center' },

  /* Recent sessions */
  recentTitle:    { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 16 },
  sessionItem:    { flexDirection: 'row', gap: 14, marginBottom: 16 },
  sessionDot:     { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 },
  sessionContent: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1, gap: 4 },
  sessionTag:     { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  sessionTagText: { fontSize: 11, fontWeight: '700' },
  sessionDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessionDate:    { fontSize: 11, color: '#aaa' },
  sessionTitle:   { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  sessionNotes:   { fontSize: 12, color: '#888', lineHeight: 18 },

  emptyCard:    { alignItems: 'center', padding: 40, gap: 8 },
  emptyText:    { fontSize: 15, fontWeight: '600', color: '#666' },
  emptySubText: { fontSize: 13, color: '#aaa', textAlign: 'center', lineHeight: 18 },
})
