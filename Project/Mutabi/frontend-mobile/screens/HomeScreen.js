import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, FontAwesome, FontAwesome6 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Header from '../components/Header'
import { apiGet } from '../utils/api'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomeScreen({ onTabPress }) {
  const navigation = useNavigation()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res  = await apiGet('/dashboard/parent')
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Failed to load data'); return }
      setData(json)
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={BLUE} size="large" />
    </View>
  )

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={() => { setLoading(true); setError(''); fetchData() }} style={styles.retryBtn}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  )

  const todayEx   = data?.today_exercises?.[0]
  const childName = data?.child?.name?.split(' ')[0] || 'your child'
  const parentName = data?.parent_name?.split(' ')[0] || 'there'

  const apptDate = data?.upcoming_appointment?.appointment
    ? new Date(data.upcoming_appointment.appointment)
        .toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    : null

  return (
    <View style={{ flex: 1 }}>
      <Header
        clinicName={data?.clinic_name}
        onBellPress={() => navigation.navigate('Notifications')}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Greeting */}
        <Text style={styles.greeting}>{greeting()}, {parentName}</Text>
        <Text style={styles.subGreeting}>Here's how we're supporting {childName} today.</Text>

        {/* Priority Goal Card */}
        {todayEx ? (
          <LinearGradient
            colors={['#1F6FEB', '#0a3d9e', '#0F4C81']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.goalCard}
          >
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>★  Priority Goal</Text>
            </View>
            <Text style={styles.goalTitle}>{todayEx.exercise_title}</Text>
            <View style={styles.goalMeta}>
              {todayEx.duration_minutes ? (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={13} color="#ccc" />
                  <Text style={styles.metaText}>{todayEx.duration_minutes} mins</Text>
                </View>
              ) : null}
              {todayEx.reps ? (
                <View style={styles.metaItem}>
                  <Ionicons name="repeat-outline" size={13} color="#ccc" />
                  <Text style={styles.metaText}>{todayEx.reps} reps</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => onTabPress('Therapy')}
              activeOpacity={0.85}
            >
              <Text style={styles.startBtnText}>Start Session →</Text>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <View style={styles.emptyGoalCard}>
            <Ionicons name="calendar-outline" size={32} color="#aaa" />
            <Text style={styles.emptyGoalText}>No exercise assigned for today</Text>
          </View>
        )}

        {/* Doctor's Notes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Doctor's Notes</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>

        {data?.latest_note ? (
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <View style={styles.docAvatar}>
                <Ionicons name="person" size={18} color={BLUE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{data.latest_note.doctor_name}</Text>
                <Text style={styles.docSpecialty}>
                  {data.latest_note.doctor_specialty || 'Therapist'}
                </Text>
              </View>
            </View>
            <View style={styles.quoteRow}>
              <View style={styles.quoteAccent} />
              <Text style={styles.noteContent}>{data.latest_note.content}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noteCard}>
            <Text style={styles.emptyText}>No notes yet</Text>
          </View>
        )}

        {/* Awareness Articles */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Awareness Articles</Text>
          <TouchableOpacity><Text style={styles.viewAll}>Explore Library</Text></TouchableOpacity>
        </View>
        <View style={styles.noteCard}>
          <Text style={styles.emptyText}>Articles coming soon</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>WEEKLY STREAK</Text>
            <View style={styles.statValue}>
              <Text style={styles.statNumber}>— Days</Text>
              <FontAwesome6 name="fire" size={20} color="#ccc" />
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>UPCOMING APPT.</Text>
            <View style={styles.statValue}>
              <Text style={styles.statNumber}>{apptDate || '—'}</Text>
              <FontAwesome name="calendar-o" size={18} color={BLUE} />
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText:     { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  retryBtn:      { backgroundColor: '#1F6FEB', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText:     { color: '#fff', fontWeight: '600' },
  scroll:        { padding: 20, paddingBottom: 24 },
  greeting:      { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  subGreeting:   { fontSize: 13, color: '#888', marginBottom: 20 },

  /* Goal card */
  goalCard:      { borderRadius: 16, padding: 20, marginBottom: 24 },
  priorityBadge: { backgroundColor: ORANGE, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 },
  priorityText:  { color: '#fff', fontSize: 12, fontWeight: '700' },
  goalTitle:     { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  goalMeta:      { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metaItem:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:      { color: '#ccc', fontSize: 13 },
  startBtn:      { backgroundColor: ORANGE, borderRadius: 10, height: 44, alignItems: 'center', justifyContent: 'center' },
  startBtnText:  { color: '#fff', fontSize: 15, fontWeight: '600' },
  emptyGoalCard: { backgroundColor: '#f0f4ff', borderRadius: 16, padding: 30, marginBottom: 24, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#dce8ff', borderStyle: 'dashed' },
  emptyGoalText: { fontSize: 14, color: '#aaa', textAlign: 'center' },

  /* Sections */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  viewAll:       { fontSize: 13, color: ORANGE },

  /* Doctor note */
  noteCard:    { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  noteHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  docAvatar:   { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center' },
  docName:     { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  docSpecialty:{ fontSize: 12, color: '#888' },
  quoteRow:    { flexDirection: 'row', gap: 10 },
  quoteAccent: { width: 3, borderRadius: 2, backgroundColor: ORANGE },
  noteContent: { flex: 1, fontSize: 13, color: '#444', lineHeight: 20 },
  emptyText:   { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 10 },

  /* Stats */
  statsRow:   { flexDirection: 'row', gap: 12 },
  statCard:   { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statLabel:  { fontSize: 11, color: '#888', marginBottom: 8, fontWeight: '600', letterSpacing: 0.3 },
  statValue:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statNumber: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
})
